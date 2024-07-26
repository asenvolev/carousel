import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { throttle } from "../utils/helpers";


const Carousel = ({imageUrls, imagesToShiftCount}) => {
    const carouselRef = useRef(null);
    const [startX, setStartX] = useState(0);
    const [translateX, setTranslateX] = useState(-window.innerWidth * imagesToShiftCount);
    const [initialTranslateX, setInitialTranslateX] = useState(0);
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


            carousel.addEventListener('wheel', onWheel);
            carousel.addEventListener("keydown", preventArrowKeyScroll);
            return () => {
                carousel.removeEventListener("keydown", preventArrowKeyScroll);
                carousel.removeEventListener('wheel', onWheel);
            };
        }
    }, []);


    const addAndRemoveImage = () => {
        if (currentIndex < 2) {
            setImageIndexes(prevImages => {
                const newImages = [...Array.from({ length: imagesToShiftCount }, (_, i) => prevImages[0] - (i + 1)).reverse(), ...prevImages.slice(0, -imagesToShiftCount)];
                setCurrentIndexWithoutTransition(imagesToShiftCount+1);
                return newImages;
            });
        } else if (currentIndex > (imagesToShiftCount * 2 - 1)) {
            setImageIndexes(prevImages => {
                const newImages = [...prevImages.slice(imagesToShiftCount), ...Array.from({ length: imagesToShiftCount }, (_, i) => prevImages[prevImages.length - 1] + (i + 1))];
                setCurrentIndexWithoutTransition(imagesToShiftCount);
                return newImages;
            });
        }
    };

    const setCurrentIndexWithoutTransition = (value) => {
        setTransitionEnabled(false);
        setCurrentIndex(value);
        requestAnimationFrame(() => {
            setTransitionEnabled(true);
        });
    };

    const moveToNextSlide = (delta) => {
        if (delta < 0) {
            setCurrentIndex(prevIndex => prevIndex+1);
        } else if (delta > 0) {
            setCurrentIndex(prevIndex => prevIndex-1);
        }
    };

    const onWheel = throttle((e) => {
        moveToNextSlide(e.deltaY);
    },500);

    const onTouchStart = (e) => {
        setStartX(e.touches[0].pageX);
        setInitialTranslateX(translateX);
    };

    const onTouchMove = throttle((e) => {
        const x = e.touches[0].pageX;
        const walk = x - startX;
        setTranslateX(initialTranslateX + walk);
    }, 150);

    const onTouchEnd = (e) => {
        const endX = e.changedTouches[0].pageX;
        const deltaX = endX - startX;
        moveToNextSlide(deltaX);
        setStartX(0);
    };

    const onTransitionEnd = () => {
        if (!startX) {
            addAndRemoveImage();
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
                style={{ transform: `translateX(-${currentIndex*100}%)`, transition: transitionEnabled ? 'transform 0.3s ease' : 'none' }}
                onTransitionEnd={onTransitionEnd}
            >
                {imageIndexes.map((val, index) => {
                    const imgIndex = (val + imageUrls.length) % imageUrls.length;
                     return (
                     <CarouselImage 
                        key={index} 
                        $bgrimg={imageUrls[imgIndex]} 
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
