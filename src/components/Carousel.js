import { useRef, useState } from "react";
import styled from "styled-components";
import { throttle } from "../utils/helpers";

const Carousel = () => {
    const carouselRef = useRef(null);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const moveToNextSlide = (delta) => {
        const carousel = carouselRef.current;
        if (carousel) {
            const slideWidth = window.innerWidth;
            const currentSlide = Math.round(carousel.scrollLeft / slideWidth);
            if (delta < 0) {
                carousel.scrollLeft = (currentSlide+1) * slideWidth;
            } else if (delta > 0) {
                carousel.scrollLeft = (currentSlide-1) * slideWidth;
            }
        }
    }

    const onWheel = throttle((e) => {
        moveToNextSlide(e.deltaY)
    }, 500);

    const onTouchStart = (e) => {
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
    }, 50);

    const onTouchEnd = (e) => {
        const endX = e.changedTouches[0].pageX;
        const deltaX = endX - startX;
        
        moveToNextSlide(deltaX)
    };

    return (
    <CarouselWrapper>
        <CarouselContainer
            ref={carouselRef}  
            onWheel={onWheel} 
            onTouchStart={onTouchStart} 
            onTouchMove={onTouchMove} 
            onTouchEnd={onTouchEnd}>

            <CarouselImage/>
            <CarouselImage/>
            <CarouselImage/>

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
    touch-action: pan-y;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory; 

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