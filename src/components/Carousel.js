import { useRef, useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import { throttle } from "../utils/helpers";
import CarouselImage from './CarouselImage';

const Carousel = ({imageUrls, imagesToShiftCount}) => {
    const carouselRef = useRef(null);
    const [startX, setStartX] = useState(0);
    const [touchStartIndex, setTouchStartIndex] = useState(0);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(imagesToShiftCount);
    const [imageIndexes, setImageIndexes] = useState(Array.from({ length: 2*imagesToShiftCount+1 }, (_, index) => index));

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

    const moveToNextSlide = useCallback((delta) => {
        setCurrentIndex(prevIndex => {
            if (prevIndex % 1 !== 0) {
                return delta < 0 ? Math.ceil(prevIndex) : Math.floor(prevIndex);
            }
            return prevIndex + (delta < 0 ? 1 : -1);
        });
    },[]);

    const onWheel = useCallback((e) => {
        moveToNextSlide(e.deltaY);
    },[moveToNextSlide]);

    const throttledOnWheel = useMemo(() => throttle(onWheel, 150), [onWheel]);

    const onTouchStart = (e) => {
        setStartX(e.touches[0].pageX);
        setTouchStartIndex(currentIndex);
    };

    const onTouchMove = useCallback((e) => {
        const x = e.touches[0].pageX;
        const walk = x - startX;
        const percentageWalk = (walk / carouselRef.current.clientWidth);
        setCurrentIndex(touchStartIndex - percentageWalk);
        console.log(e);
    }, [startX, touchStartIndex]);

    const throttledOnTouchMove = useMemo(() => throttle(onTouchMove, 150), [onTouchMove]);

    const onTouchEnd = (e) => {
        const endX = e.changedTouches[0].pageX;
        const deltaX = endX - startX;
        moveToNextSlide(deltaX);
        setStartX(0);
    };

    const onKeyDown = (e) => {
        e.preventDefault();
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