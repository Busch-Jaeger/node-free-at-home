

export function uint32ToHSV(value: number) {
    const v = ((value >>> 0) & 0xff) / 0xff;
    const s = ((value >>> 8) & 0xff) / 0xff;
    const h = ((value >>> 16) & 0xffff) / 0xffff;
    return [h, s, v];
}

export function hsvTouint32(h: number, s: number, v: number) {
    h = Math.round((h * 0xffff));
    s = Math.round(s * 0xff);
    v = Math.round(v * 0xff);
    return ((v << 0) + (s << 8) + (h << 16)) >>> 0;
}

export function rgbToHsv(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = max;
    const s = (max == 0) ? 0 : delta / max;
    const v = max;

    if (max == min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / delta + 0; break;
            case g: h = (b - r) / delta + 2; break;
            case b: h = (r - g) / delta + 4; break;
        }
        if(h < 0)
            h += 6;
        h /= 6; // 360 / 6 -> 60 degree
    }

    return [h, s, v];
}

export function hsvToRgb(h: number, s: number, v: number) {
    let r = 0;
    let g = 0;
    let b = 0;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}
