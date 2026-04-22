const _cache = {};

export function getImg(path) {
    if (!_cache[path]) {
        const img = new Image();
        img.src = path;
        _cache[path] = img;
    }
    return _cache[path];
}

export function preloadImages(paths) {
    return Promise.all(
        paths.map(
            (path) =>
                new Promise((resolve) => {
                    const img = getImg(path);
                    if (img.complete && img.naturalWidth) {
                        resolve(img);
                    } else {
                        img.onload = () => resolve(img);
                        img.onerror = () => resolve(img);
                    }
                }),
        ),
    );
}

export function preloadFonts(fontSpecs) {
    return Promise.all(
        fontSpecs.map((spec) => document.fonts.load(spec).catch(() => null)),
    );
}
