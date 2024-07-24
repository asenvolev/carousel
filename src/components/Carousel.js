import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { throttle, debounce } from "../utils/helpers";

const Carousel = () => {
    const carouselRef = useRef(null);
    const isTouching = useRef(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [images, setImages] = useState([0, 1, 2, 3, 4]);

    useEffect(() => {
        placeScrollInTheMiddle();
        const carousel = carouselRef.current;
        if (carousel) {
            const preventArrowKeyScroll = (e) => {
                if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                    e.preventDefault();
                }
            };

            const handleScroll = debounce(() => {
                if (!isTouching.current) {
                    placeScrollInTheMiddle(true);
                }
            },200)

            const onResize = throttle(()=>placeScrollInTheMiddle(false),25);

            carousel.addEventListener("keydown", preventArrowKeyScroll);
            carousel.addEventListener('scroll', handleScroll);
            window.addEventListener('resize', onResize);
            return () => {
                carousel.removeEventListener("keydown", preventArrowKeyScroll);
                carousel.removeEventListener('scroll', handleScroll);
                window.addEventListener('resize', onResize);
            };
        }
    }, []);

    const addAndRemoveImage = () => {
        const carousel = carouselRef.current;
        if (carousel) {
            const slideWidth = window.innerWidth;
            const currentSlide = Math.round(carousel.scrollLeft / slideWidth);
            if (currentSlide < 2) {
                setImages(prevImages => {
                    const newImages = [prevImages[0] - 1, ...prevImages.slice(0, -1)];
                    carousel.style.scrollBehavior = 'auto';
                    carousel.scrollLeft = slideWidth * 2;
                    carousel.style.scrollBehavior = 'smooth';
                    return newImages;
                });
            } else if (currentSlide > 2) {
                setImages(prevImages => {
                    const newImages = [...prevImages.slice(1), prevImages[prevImages.length - 1] + 1];
                    carousel.style.scrollBehavior = 'auto';
                    carousel.scrollLeft = slideWidth * 2;
                    carousel.style.scrollBehavior = 'smooth';

                    return newImages;
                });
            }
        }
    };

    const placeScrollInTheMiddle = (addRemoveImage) => {
        const carousel = carouselRef.current;
        if (carousel) {
            
            if (addRemoveImage) {
                addAndRemoveImage();
            } else {
                const slideWidth = window.innerWidth;

                carousel.style.scrollBehavior = 'auto';
                carousel.scrollLeft = slideWidth * 2;
                carousel.style.scrollBehavior = 'smooth';
            }
            
        }
    };

    const moveToNextSlide = (delta) => {
        const carousel = carouselRef.current;
        if (carousel) {
            const slideWidth = window.innerWidth;
            const currentSlide = Math.round(carousel.scrollLeft / slideWidth);
            if (Math.abs(delta) > slideWidth/2) {
                carousel.scrollLeft = currentSlide * slideWidth;
            } else if (delta < 0) {
                carousel.scrollLeft = (currentSlide+1) * slideWidth;
            } else if (delta > 0) {
                carousel.scrollLeft = (currentSlide-1) * slideWidth;
            }
        }
    }

    const onWheel = throttle((e) => {
        moveToNextSlide(e.deltaY);
    }, 1000);

    const onTouchStart = (e) => {
        isTouching.current = true;
        const carousel = carouselRef.current;
        if (carousel) {
            setStartX(e.touches[0].pageX);
            setScrollLeft(carousel.scrollLeft);
        }
    };

    const onTouchMove = throttle((e) => {
        const carousel = carouselRef.current;
        if (carousel) {
            const x = e.touches[0].pageX;
            const walk = x - startX;
            carousel.scrollLeft = scrollLeft - walk;
        }
    }, 150);

    const onTouchEnd = (e) => {
        isTouching.current = false;
        const endX = e.changedTouches[0].pageX;
        const deltaX = endX - startX;
        moveToNextSlide(deltaX)
        
    };

    return (
    <CarouselWrapper>
        <CarouselContainer
            ref={carouselRef} 
            tabIndex={0}
            onWheel={onWheel} 
            onTouchStart={onTouchStart} 
            onTouchMove={onTouchMove} 
            onTouchEnd={onTouchEnd}>

            {images.map((val, index) => <CarouselImage key={index} >{val}</CarouselImage>)}

        </CarouselContainer>
    </CarouselWrapper>)
}

export default Carousel;

const CarouselWrapper = styled.div`
    width:100%;
    height:100vh;
    background-color:blue;
`;

const CarouselContainer = styled.div`
    width:100%;
    height:100%;

    overflow-x:hidden;
    touch-action: none;
    scroll-behavior: smooth;

    display:flex;
    flex-wrap:no-wrap;
    align-items:center;
`;

const CarouselImage = styled.div`
    scroll-snap-align: center;

    min-width:100%;
    height:100%;
    flex-shrink:0;
    background-color:green;
    box-shadow: inset 0 0 0 1px yellow;
`;