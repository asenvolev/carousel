import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { throttle } from "../utils/helpers";

const DEFAULT_TRANSLATE = -window.innerWidth * 2

const Carousel = ({imageUrls}) => {
    const carouselRef = useRef(null);
    const [startX, setStartX] = useState(0);
    const [translateX, setTranslateX] = useState(DEFAULT_TRANSLATE);
    const [initialTranslateX, setInitialTranslateX] = useState(0);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const [imageIndexes, setImageIndexes] = useState(Array.from({ length: 5 }, (_, index) => index));


    useEffect(() => {
        const carousel = carouselRef.current;
        if (carousel) {
            const preventArrowKeyScroll = (e) => {
                if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                    e.preventDefault();
                }
            };
            const onResize = throttle(() => setTranslateXWithoutTransition(-window.innerWidth * 2), 1);


            carousel.addEventListener('wheel', onWheel);
            carousel.addEventListener("keydown", preventArrowKeyScroll);
            window.addEventListener('resize', onResize);
            return () => {
                carousel.removeEventListener("keydown", preventArrowKeyScroll);
                carousel.removeEventListener('wheel', onWheel);
                window.removeEventListener('resize', onResize);
            };
        }
    }, []);


    const addAndRemoveImage = () => {
        const carousel = carouselRef.current;
        if (carousel) {
            const slideWidth = window.innerWidth;
            const currentSlide = Math.round(translateX / -slideWidth);
            if (currentSlide < 2) {
                setImageIndexes(prevImages => {
                    const newImages = [prevImages[0] - 1, ...prevImages.slice(0, -1)];
                    setTranslateXWithoutTransition(-slideWidth * 2);
                    return newImages;
                });
            } else if (currentSlide > 2) {
                setImageIndexes(prevImages => {
                    const newImages = [...prevImages.slice(1), prevImages[prevImages.length - 1] + 1];
                    setTranslateXWithoutTransition(-slideWidth * 2);
                    return newImages;
                });
            }
        }
    };

    const setTranslateXWithoutTransition = (value) => {
        setTransitionEnabled(false);
        setTranslateX(value);
        requestAnimationFrame(() => {
            setTransitionEnabled(true);
        });
    };

    const moveToNextSlide = (delta) => {
        const slideWidth = window.innerWidth;
        setTranslateX((prevTranslateX) => {
            const currentSlide = Math.round(prevTranslateX / -slideWidth);
            let newTranslateX;
            if (Math.abs(delta) > slideWidth / 2) {
                newTranslateX = currentSlide * -slideWidth;
            } else if (delta < 0) {
                newTranslateX = (currentSlide + 1) * -slideWidth;
            } else if (delta > 0) {
                newTranslateX = (currentSlide - 1) * -slideWidth;
            }
            return newTranslateX;
        });
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
                style={{ transform: `translateX(${translateX}px)`, transition: transitionEnabled ? 'transform 0.3s ease' : 'none' }}
                onTransitionEnd={onTransitionEnd}
            >
                {imageIndexes.map((val, index) => {
                    const imgIndex = (val + imageUrls.length) % imageUrls.length;
                     return (
                     <CarouselImage 
                        key={index} 
                        bgrimg={imageUrls[imgIndex]} 
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
    transition: transform 0.3s ease;
`;

const CarouselImage = styled.div`
    scroll-snap-align: center;
    min-width: 100%;
    height: 100%;
    flex-shrink: 0;
    background: transparent url(${props => props.bgrimg}) no-repeat center center;
    background-size:cover;
`;
