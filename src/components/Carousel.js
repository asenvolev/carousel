import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { throttle } from "../utils/helpers";

const Carousel = ({imageUrls, imagesToShiftCount}) => {
    const carouselRef = useRef(null);
    const [startX, setStartX] = useState(0);
    const [touchStartIndex, setTouchStartIndex] = useState(0);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(imagesToShiftCount);
    const [imageIndexes, setImageIndexes] = useState(Array.from({ length: 2*imagesToShiftCount+1 }, (_, index) => index));

    useEffect(() => {
        const carousel = carouselRef.current;
        if (carousel) {
            const preventArrowKeyScroll = (e) => {
                if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                    e.preventDefault();
                }
            };
            const onWheel = throttle((e) => {
                moveToNextSlide(e.deltaY);
            },500);

            carousel.addEventListener('wheel', onWheel);
            carousel.addEventListener("keydown", preventArrowKeyScroll);
            return () => {
                carousel.removeEventListener("keydown", preventArrowKeyScroll);
                carousel.removeEventListener('wheel', onWheel);
            };
        }
    }, []);

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

    const moveToNextSlide = (delta) => {
        setCurrentIndex(prevIndex => {
            if (prevIndex % 1 !== 0) {
                return delta < 0 ? Math.ceil(prevIndex) : Math.floor(prevIndex);
            }
            return prevIndex + (delta < 0 ? 1 : -1);
        });
    };

    const onTouchStart = (e) => {
        setStartX(e.touches[0].pageX);
        setTouchStartIndex(currentIndex);
    };

    const onTouchMove = throttle((e) => {
        const x = e.touches[0].pageX;
        const walk = x - startX;
        const percentageWalk = (walk / carouselRef.current.clientWidth);
        setCurrentIndex(touchStartIndex - percentageWalk);
    }, 150);

    const onTouchEnd = (e) => {
        const endX = e.changedTouches[0].pageX;
        const deltaX = endX - startX;
        moveToNextSlide(deltaX);
        setStartX(0);
    };

    const onTransitionEnd = () => {
        const shouldShiftIndexes = currentIndex < 2 || currentIndex > imageIndexes.length - 2;
        if (!startX && shouldShiftIndexes) {
            addAndRemoveIndexes();
        }
    }

    return (
        <CarouselWrapper>
            <CarouselContainer
                ref={carouselRef}
                tabIndex={0}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{ transform: `translate3d(-${currentIndex*100}%, 0, 0)`, transition: transitionEnabled ? 'transform 0.3s ease' : 'none' }}
                onTransitionEnd={onTransitionEnd}
            >
                {imageIndexes.map((val, index) => {
                    const imgIndex = (val - imagesToShiftCount + imageUrls.length) % imageUrls.length;
                     return (
                     <CarouselImage 
                        key={index} 
                        $bgrimg={imageUrls[imgIndex ]} 
                    />)
                })}
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

const CarouselImage = styled.div`
    min-width: 100%;
    height: 100%;
    flex-shrink: 0;
    background: transparent url(${props => props.$bgrimg}) no-repeat center center;
    background-size:cover;
`;