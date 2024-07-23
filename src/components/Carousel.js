import { useRef, useState } from "react";
import styled from "styled-components";
import { debounce } from "../utils/helpers";

const Carousel = () => {
    const carouselRef = useRef(null);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onWheel = (e) => {
        console.log(e);
      const carousel = carouselRef.current;
      if (carousel) {
        console.log(e.deltaY)
        if (e.deltaY > 0) {
            carousel.scrollLeft += window.innerWidth;
        } else {
            carousel.scrollLeft -= window.innerWidth;
        }
      }
    };

    const debouncedOnScroll = debounce(onWheel, 200);

    const onTouchStart = (e) => {
        const carousel = carouselRef.current;
        if (carousel) {
            setStartX(e.touches[0].pageX);
            setScrollLeft(carousel.scrollLeft);
        }
    };

    const onTouchMove = (e) => {
        console.log('onTouchMove: ', e.touches[0].pageX)
        const carousel = carouselRef.current;
        if (carousel) {
            const x = e.touches[0].pageX;
            const walk = x - startX;
            carousel.scrollLeft = scrollLeft - walk;
        }
    };


    const onTouchEnd = (e) => {
        const carousel = carouselRef.current;
        if (carousel) {
            const endX = e.changedTouches[0].pageX;
            const deltaX = endX - startX;
            const slideWidth = window.innerWidth;
            const currentSlide = Math.round(carousel.scrollLeft / window.innerWidth);
            if (deltaX < 0) {
                carousel.scrollLeft = (currentSlide+1) * slideWidth;
            } else if (deltaX > 0) {
                carousel.scrollLeft = (currentSlide-1) * slideWidth;
            }
        }
    };

    return (
    <CarouselWrapper 
        ref={carouselRef}  
        onWheel={debouncedOnScroll} 
        onTouchStart={onTouchStart} 
        onTouchMove={onTouchMove} 
        onTouchEnd={onTouchEnd}
    >
        <CarouselContainer>

            <CarouselImage/>
            <CarouselImage/>
            <CarouselImage/>

        </CarouselContainer>
    </CarouselWrapper>)
}

export default Carousel;

const CarouselWrapper = styled.div`

    width:100%;
    overflow-x:scroll;
    scroll-behavior: smooth;
    touch-action:none;
    background-color:blue;
`;

const CarouselContainer = styled.div`
    width:300%;
    display:flex;
    flex-wrap:no-wrap;
    align-items:center;
    gap:10px;
`;

const CarouselImage = styled.div`
    width:100%;
    height:300px;
    background-color:black;
`;