import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { debounce } from "../utils/helpers";

const Carousel = () => {

    const carouselRef = useRef(null);
    const [startX, setStartX] = useState(0);
    const [isDragging, setIsDragging] = useState(0);

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
        setIsDragging(true);
        const carousel = carouselRef.current;
        if (carousel) {
            setStartX(e.touches[0].pageX);
        }
    };

    const onTouchMove = (e) => {
        if (!isDragging) return;
        const carousel = carouselRef.current;
        if (carousel) {
            const x = e.touches[0].pageX;
            const walk = x - startX;
            carousel.scrollLeft -= walk;
            setStartX(x);
        }
    };

    const onTouchEnd = () => {
        setIsDragging(false);
        const carousel = carouselRef.current;
        if (carousel) {
            const deltaX = startX - carousel.scrollLeft;

            if (deltaX > 0) {
                carousel.scrollLeft += window.innerWidth;
            } else {
                carousel.scrollLeft -= window.innerWidth;
            }
        }
    };

    return (
    <CarouselWrapper ref={carouselRef}  onWheel={debouncedOnScroll} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
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