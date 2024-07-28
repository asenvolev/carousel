import { FC, useState, useEffect, memo } from "react";
import styled from "styled-components";
import { loadImage } from "../utils/helpers";

interface Props {
    imageUrl:string;
}

const CarouselImage : FC<Props> = ({ imageUrl }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(false);
        loadImage(imageUrl).then(() => setIsLoaded(true))
            .catch(error => console.error(`Error loading image: ${imageUrl}`, error));
    }, [imageUrl]);

    return (
        <Image data-testid="carousel-image"
            bgrImage={imageUrl} 
            opacity={isLoaded ? 1 : 0.5}
        />
    );
};

export default memo(CarouselImage);

const Image = styled.div<{bgrImage: string; opacity: number}>`
    min-width: 100%;
    height: 100%;
    flex-shrink: 0;
    background: transparent url(${({bgrImage}) => bgrImage}) no-repeat center center;
    background-size: cover;
    opacity:${({opacity}) => opacity};
    transition: opacity 0.1s ease;
`;