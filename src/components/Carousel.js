import styled from "styled-components";


const Carousel = () => {

    const onScroll = (e) => {
        console.log(e);
    }

    return (<CarouselWrapper onScroll={onScroll}>
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