import {act} from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarouselImage from './CarouselImage';
import { loadImage } from '../utils/helpers';

jest.mock('../utils/helpers', () => ({
  loadImage: jest.fn(),
}));

describe('CarouselImage', () => {
  const testImageUrl = 'https://picsum.photos/200/300';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with initial opacity of 0.5', () => {
    loadImage.mockImplementation(() => Promise.resolve());

    render(<CarouselImage imageUrl={testImageUrl} />);
    const image = screen.getByTestId('carousel-image');
    expect(image).toHaveStyle('opacity: 0.5'); 
  });

  test('changes opacity to 1 when image is loaded', async () => { 
    loadImage.mockResolvedValue(() => Promise.resolve());
    
    render(<CarouselImage imageUrl={testImageUrl} />);
    const image = screen.getByTestId('carousel-image');
    
    await act(async () => {
        await loadImage(testImageUrl);
      });

    expect(image).toHaveStyle('opacity: 1');
  });

  test('keeps opacity at 0.5 if image fails to load', async () => {
    loadImage.mockRejectedValue(new Error('Image load failed'));
    
    render(<CarouselImage imageUrl={testImageUrl} />);
    const image = screen.getByTestId('carousel-image');
    
    await expect(loadImage()).rejects.toThrow('Image load failed');

    expect(image).toHaveStyle('opacity: 0.5');
  });

  test('logs error when image fails to load', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    loadImage.mockRejectedValue(new Error('Image load failed'));
    
    render(<CarouselImage imageUrl={testImageUrl} />);
    
    await expect(loadImage()).rejects.toThrow('Image load failed');

    expect(consoleSpy).toHaveBeenCalledWith(`Error loading image: ${testImageUrl}`, expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('reloads image when imageUrl prop changes', async () => {
    loadImage.mockResolvedValue(undefined);
    
    const { rerender } = render(<CarouselImage imageUrl={testImageUrl} />);
    
    const newImageUrl = 'https://picsum.photos/200/301';
    rerender(<CarouselImage imageUrl={newImageUrl} />);

    expect(loadImage).toHaveBeenCalledTimes(2);
    expect(loadImage).toHaveBeenCalledWith(newImageUrl);
  });
});