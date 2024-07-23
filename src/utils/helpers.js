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