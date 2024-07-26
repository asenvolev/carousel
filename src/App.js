import { useEffect, useState } from "react";
import Carousel from './components/Carousel';
import styled from "styled-components";

const App = () => {

  const [imageUrls, setImageUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
      fetchImages();
      setIsLoading(true);
  },[])

  const fetchImages = async () => {
    try {
        const response = await fetch('https://picsum.photos/v2/list?page=2&limit=1999');
        const data = await response.json();
        const urls = data.map(image => image.download_url);
        setImageUrls(urls);
        setIsLoading(false);
    } catch (error) {
        console.error('Error fetching images:', error);
    }
  };
  if (isLoading) {
    return <Loading>Loading...</Loading>;
  }

  return (
    <AddYourDimensionsHereItWillFIT>
      <Carousel imageUrls={imageUrls} imagesToShiftCount={9}/>
    </AddYourDimensionsHereItWillFIT>
  );
}

export default App;

const AddYourDimensionsHereItWillFIT = styled.div`
  width:100%;
  height:100vh;
`;

const Loading = styled.div`
    width: 100%;
    height: 100vh;
    background-color: grey;
    text-align: center;
    vertical-align: middle;
    font-size:32px;
`;
