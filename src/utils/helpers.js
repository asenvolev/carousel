export const debounce = (func, delay) => {
    let timer;
    return function (...args) {
        timer && clearTimeout(timer);
        timer = setTimeout(()=> func(...args), delay);
    }
};

export const throttle = (func, delay) => {
    let timer;
    let shouldWait = false;
    return function (...args) {
        if (shouldWait) return;
        func(...args)
        shouldWait = true;
        timer && clearTimeout(timer);

        timer = setTimeout(()=> {
            shouldWait = false;
        }, delay);
    }
};

export const loadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
};

export const preloadImages = (urls) => {
    const imagePromises = urls.map(url => loadImage(url));
    return Promise.all(imagePromises);
};