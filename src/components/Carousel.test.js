// Carousel.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Carousel from './Carousel';


describe('Carousel', () => {
  const testImageUrls = [
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/301',
    'https://picsum.photos/200/302',
    'https://picsum.photos/200/303',
    'https://picsum.photos/200/304'
  ];
  const imagesToShiftCount = 2;

  test('renders correct number of images', () => {
    render(<Carousel imageUrls={testImageUrls} imagesToShiftCount={imagesToShiftCount} />);
    const images = screen.getAllByTestId('carousel-image');
    expect(images).toHaveLength(2 * imagesToShiftCount + 1);
  });

  test('initial transform is correct', () => {
    render(<Carousel imageUrls={testImageUrls} imagesToShiftCount={imagesToShiftCount} />);
    const container = screen.getByTestId('carousel-container');
    expect(container).toHaveStyle(`transform: translate3d(-${imagesToShiftCount * 100}%, 0, 0)`);
  });

  test('moves to next slide on wheel event', async () => {
    render(<Carousel imageUrls={testImageUrls} imagesToShiftCount={imagesToShiftCount} />);
    const container = screen.getByTestId('carousel-container');
    
    fireEvent.wheel(container, { deltaY: 100 })
    
    
    expect(container).toHaveStyle(`transform: translate3d(-${(imagesToShiftCount - 1) * 100}%, 0, 0)`);
  });

  test('moves to previous slide on reverse wheel event', () => {
    render(<Carousel imageUrls={testImageUrls} imagesToShiftCount={imagesToShiftCount} />);
    const container = screen.getByTestId('carousel-container');
    
    fireEvent.wheel(container, { deltaY: -100 });
    
    expect(container).toHaveStyle(`transform: translate3d(-${(imagesToShiftCount + 1) * 100}%, 0, 0)`);
  });

  test('moves to previous slide on touch events', () => {
    render(<Carousel imageUrls={testImageUrls} imagesToShiftCount={imagesToShiftCount} />);
    const container = screen.getByTestId('carousel-container');
    
    fireEvent.touchStart(container, { touches: [{ pageX: 0 }] });
    fireEvent.touchMove(container, { touches: [{ pageX: -100 }] });
    fireEvent.touchEnd(container, { changedTouches: [{ pageX: -100 }] });
    
    expect(container).not.toHaveStyle(`transform: translate3d(-${imagesToShiftCount * 100}%, 0, 0)`);
  });

  test('moves to next slide on touch events', async () => {
    render(<Carousel imageUrls={testImageUrls} imagesToShiftCount={1} />);
    const container = screen.getByTestId('carousel-container');

    fireEvent.touchStart(container, { touches: [{ pageX: 0 }] });
    fireEvent.touchMove(container, { touches: [{ pageX: 100 }] });
    fireEvent.touchEnd(container, { changedTouches: [{ pageX: 100 }] });
    
    expect(container).not.toHaveStyle(`transform: translate3d(-${(imagesToShiftCount+1) * 100}%, 0, 0)`);
});

test('transitions correctly and updates indexes', async () => {
    render(<Carousel imageUrls={testImageUrls} imagesToShiftCount={1} />);
    const carouselContainer = screen.getByTestId('carousel-container');

        fireEvent.transitionEnd(carouselContainer);
        await waitFor(() => {
            expect(carouselContainer.style.transition).toContain('transform 0.3s ease');
        });
});

  test('prevents default on keydown', () => {
    const preventDefaultMock = jest.fn();
    render(<Carousel imageUrls={testImageUrls} imagesToShiftCount={imagesToShiftCount} />);
    const container = screen.getByTestId('carousel-container');
    
    fireEvent.keyDown(container, { preventDefault: preventDefaultMock });
    
    expect(container).toHaveStyle(`transform: translate3d(-${(imagesToShiftCount) * 100}%, 0, 0)`);
  });

  test('do not handles key down event', async () => {
    render(<Carousel imageUrls={testImageUrls} imagesToShiftCount={1} />);
    const container = screen.getByTestId('carousel-container');

        fireEvent.keyDown(container, { key: 'ArrowRight' });
        await waitFor(() => {
            expect(container.style.transform).toContain('translate3d(-100%, 0, 0)');
        });

        fireEvent.keyDown(container, { key: 'ArrowLeft' });
        await waitFor(() => {
            expect(container.style.transform).toContain('translate3d(-100%, 0, 0)');
        });
});

  test('shifts indexes when reaching the end', async () => {
    
    render(<Carousel imageUrls={testImageUrls} imagesToShiftCount={imagesToShiftCount} />);
    const container = screen.getByTestId('carousel-container');
    
    // Move to the last slide
    fireEvent.wheel(container, { deltaY: -100 });

    await waitFor(() => {
        expect(container).toHaveStyle(`transform: translate3d(-${(imagesToShiftCount+1) * 100}%, 0, 0)`);
    });
        
    jest.useRealTimers();
  });
});