type Procedure<T = any> = (...args: T[]) => void;

export const debounce = <T extends Procedure>(func: T, delay: number): T => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    } as T;
  };

type ThrottleCallback<T extends any[]> = (...args: T) => void;

export const throttle = <T extends any[]>(func:ThrottleCallback<T>, delay:number) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let shouldWait = false;
    return (...args:T) => {
        if (shouldWait) return;
        func(...args)
        shouldWait = true;
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(()=> {
            shouldWait = false;
        }, delay);
    }
};

export const loadImage = (url:string) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
};

export const preloadImages = (urls:string[]) => {
    const imagePromises = urls.map(url => loadImage(url));
    return Promise.all(imagePromises);
};