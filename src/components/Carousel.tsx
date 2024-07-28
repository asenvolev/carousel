import { useRef, useState, useCallback, useMemo, FC, TouchEvent, WheelEvent, KeyboardEvent } from "react";
import styled from "styled-components";
import { throttle } from "../utils/helpers";
import CarouselImage from './CarouselImage';

interface Props {
    imageUrls: string[];
    imagesToShiftCount: number;
}

const Carousel : FC<Props> = ({imageUrls, imagesToShiftCount}) => {
    const carouselRef = useRef<HTMLDivElement | null>(null);
    const [startX, setStartX] = useState<number>(0);
    const [touchStartIndex, setTouchStartIndex] = useState<number>(0);
    const [transitionEnabled, setTransitionEnabled] = useState<boolean>(true);
    const [currentIndex, setCurrentIndex] = useState<number>(imagesToShiftCount);
    const [imageIndexes, setImageIndexes] = useState<number[]>(Array.from({ length: 2*imagesToShiftCount+1 }, (_, index) => index));

    const addIndexesInTheBeginningRemoveFromTheEnd = () => {
        const indexesToAdd = Array.from({ length: imagesToShiftCount }, (_, i) => imageIndexes[0] - (i + 1)).reverse();
        const indexesWithRemovedEnd = imageIndexes.slice(0, -imagesToShiftCount)
        return [...indexesToAdd, ...indexesWithRemovedEnd]
    };

    const addIndexesInTheEndRemoveFromTheBeginning = () => {
        const indexesToAdd = Array.from({ length: imagesToShiftCount }, (_, i) => imageIndexes[imageIndexes.length - 1] + (i + 1))
        const indexesWithRemovedStart = imageIndexes.slice(imagesToShiftCount);
        return [...indexesWithRemovedStart, ...indexesToAdd]
    };

    const addAndRemoveIndexes = () => {
        setTransitionEnabled(false);

        const newImageIndexes = currentIndex < 2 
                    ? addIndexesInTheBeginningRemoveFromTheEnd()
                    : addIndexesInTheEndRemoveFromTheBeginning();
        
        setImageIndexes(newImageIndexes);

        requestAnimationFrame(()=>{
            setCurrentIndex(() => {
                requestAnimationFrame(() => setTransitionEnabled(true));
                return imagesToShiftCount + (currentIndex < 2 ? 1 : 0) 
            });
        })
    };

    const moveToNextSlide = useCallback((delta:number) => {
        setCurrentIndex(prevIndex => {
            if (prevIndex % 1 !== 0) {
                return delta < 0 ? Math.ceil(prevIndex) : Math.floor(prevIndex);
            }
            return prevIndex + (delta < 0 ? 1 : -1);
        });
    },[]);

    const onWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
        moveToNextSlide(event.deltaY);
    },[moveToNextSlide]);

    const throttledOnWheel = useMemo(() => throttle(onWheel, 150), [onWheel]);

    const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
        setStartX(event.touches[0].pageX);
        setTouchStartIndex(currentIndex);
    };

    const onTouchMove = useCallback((event: TouchEvent<HTMLDivElement>) => {
        if (!carouselRef.current) return;
        const x = event.touches[0].pageX;
        const walk = x - startX;
        const percentageWalk = (walk / carouselRef.current.clientWidth);
        setCurrentIndex(touchStartIndex - percentageWalk);
    }, [startX, touchStartIndex]);

    const throttledOnTouchMove = useMemo(() => throttle(onTouchMove, 150), [onTouchMove]);

    const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
        const endX = event.changedTouches[0].pageX;
        const deltaX = endX - startX;
        moveToNextSlide(deltaX);
        setStartX(0);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        event.preventDefault();
    }

    const onTransitionEnd = () => {
        const shouldShiftIndexes = currentIndex < 2 || currentIndex > imageIndexes.length - 2;
        if (!startX && shouldShiftIndexes) {
            addAndRemoveIndexes();
        }
    }

    const images = useMemo(() => imageIndexes.map((val) => {
        const imgIndex = (val - imagesToShiftCount + imageUrls.length) % imageUrls.length;
        const imageUrl = imageUrls[imgIndex];
        return <CarouselImage key={imgIndex} imageUrl={imageUrl} />;
    }), [imageIndexes, imageUrls, imagesToShiftCount]);

    return (
        <CarouselWrapper>
            <CarouselContainer
                data-testid="carousel-container"
                ref={carouselRef}
                tabIndex={0}
                onWheel={throttledOnWheel}
                onTouchStart={onTouchStart}
                onTouchMove={throttledOnTouchMove}
                onTouchEnd={onTouchEnd}
                onKeyDown={onKeyDown}
                style={{ transform: `translate3d(-${currentIndex*100}%, 0, 0)`, transition: transitionEnabled ? 'transform 0.3s ease' : 'none' }}
                onTransitionEnd={onTransitionEnd}
            >
                {images}
            </CarouselContainer>
        </CarouselWrapper>
    );
};

export default Carousel;

const CarouselWrapper = styled.div`
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

const CarouselContainer = styled.div`
    width: 100%;
    height: 100%;
    touch-action: none;
    display: flex;
    flex-wrap: no-wrap;
    align-items: center;
`;