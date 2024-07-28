import { FC, useEffect, useState } from "react";
import Carousel from './components/Carousel';
import styled from "styled-components";
import { preloadImages } from "./utils/helpers";

const IMAGES_COUNT = 100;

interface Image {
  id: number;
  author:  string;
  width:  number;
  height:  number;
  url: string;
  download_url: string;
}

const App : FC = () => {

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchImages();
}, []);

  const fetchImages = async () => {
    try {
        const response = await fetch(`https://picsum.photos/v2/list?limit=${IMAGES_COUNT}`);
        const data = await response.json() as Image[];
        const urls = data.map(image => image.download_url);

        await preloadImages(urls);

        setImageUrls(urls);
    } catch (error) {
        console.error('Error fetching images:', error);
    } finally {
        setIsLoading(false);
    }
  };


  if (isLoading) {
    return <Loading>Preloading {IMAGES_COUNT} images. Please wait...</Loading>;
  }

  return (
    <Wrapper>
      <Carousel imageUrls={imageUrls} imagesToShiftCount={9}/>
    </Wrapper>
  );
}

export default App;

const Wrapper = styled.div`
  width:100%;
  height:100vh;
`;

const Loading = styled.div`
    width: 100%;
    height: 100vh;
    background-color: grey;
    text-align: center;
    font-size:32px;
    display: flex;
    justify-content: center;
    align-items: center;
`;
