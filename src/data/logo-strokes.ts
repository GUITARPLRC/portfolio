/**
 * Pen paths used to "write" the Reynolds logo (public/logo.svg) on a visitor's first page view.
 *
 * The logo is filled brush artwork, so it can't be stroke-animated directly. Each stroke below is
 * a centreline traced along the letterforms (from the glyph's skeleton), in writing order.
 * WrittenLogo.astro draws these as an SVG mask over the logo and animates them, which reveals the
 * real artwork as if it were being written.
 *
 * - Coordinates are in the logo's 212x65 viewBox.
 * - A stroke's `parts` are drawn back to back with no pause (splitting at tips keeps direction
 *   changes crisp); there is a short pen lift between strokes.
 * - `width` must be wide enough that the finished mask covers every pixel of the glyph, or that
 *   bit of the logo stays hidden until the animation ends.
 */
export type Point = [number, number];

export type PenStroke = {
    label: string;
    width: number;
    parts: Point[][];
};

export const logoStrokes: PenStroke[] = [
    {
        label: 'R: lead-in swash, across the top, round the bowl, then down the leg',
        width: 9,
        parts: [
            [[4.8, 22.4], [3.9, 19.6], [5, 17.6], [7.6, 15.4], [9.8, 12], [19.8, 7.8], [33.9, 5.1], [42, 4.2], [55.3, 5.1], [62.9, 8.1], [65.4, 10.8], [66.2, 13.8], [65.1, 17.6], [61.8, 19.9], [50.7, 23.3], [39.3, 25.6], [33.2, 26.3]],
            [[31.6, 27.2], [32.4, 30.2], [35.9, 36.7], [38, 39.7], [42, 43], [47.3, 46.1], [56.6, 49.1], [61, 49.4], [67, 48.2]],
        ]
    },
    {
        label: 'R: stem from the top down into the bottom hook, then the small dab at its top-left',
        width: 10,
        parts: [
            [[38, 6.4], [36.6, 9.6], [33, 15], [29.6, 19.5], [27.6, 25.2], [24.3, 29.8], [21.2, 36], [18.6, 41.5], [18.3, 45], [20.9, 48.5], [24.2, 48.8], [28, 45.6], [30.6, 42.8]],
            [[28.9, 17.4], [26.6, 16.6], [23.8, 15.3]],
        ]
    },
    {
        label: 'e loop into the hairline connector, up and down the y arms, then the descender',
        width: 7,
        parts: [
            [[64.3, 33], [65.4, 34.1], [68.2, 33.3], [72.7, 30.7], [74.5, 28.6], [74, 26.7], [71.4, 25.9], [66.5, 29.2], [64.3, 32.9], [62.3, 34.6], [60.8, 38.8], [61.6, 42.5], [65.4, 43.9], [72.1, 40.6], [82.9, 31.3], [86.6, 29.8], [91.2, 27.8]],
            [[91.2, 27.8], [88.1, 29], [85.7, 31.5], [83, 37.3], [82.1, 41], [82.8, 44.3], [85.6, 43.5], [94.9, 32.4], [97.6, 31.4], [100.4, 27.7]],
            [[100.4, 27.7], [98.4, 30.4], [97.1, 35], [91.4, 46.9], [84.6, 56.9], [80.1, 60.9], [77.2, 62.7], [72.7, 62.4], [70.3, 60.7], [68.6, 57.2]],
        ]
    },
    {
        label: 'n: first downstroke, hairline up to the hump, second downstroke and exit flick',
        width: 7,
        parts: [
            [[109.4, 24.8], [106.5, 29], [104.1, 35.7], [103.5, 40], [102, 43.7]],
            [[103, 41.6], [106.4, 39], [113.7, 30.6], [116, 29.4], [119, 28.6]],
            [[119, 28.6], [116.8, 31.6], [115.4, 35.4], [115.1, 39.5], [116.3, 42.6], [118.5, 43.7], [123.1, 40.2]],
        ]
    },
    {
        label: 'o: starts inside, round the bottom, up the right side and over the top',
        width: 6,
        parts: [
            [[133.3, 28], [129.3, 31.5], [127, 35.6], [127.2, 39], [128.4, 41.4], [130.5, 41.8], [131.6, 41.2], [136.6, 40], [140.5, 36.6], [143.7, 32.9], [144.9, 28.3], [143.6, 25.8], [142, 24.5], [139.9, 23.7], [133.4, 24.1], [128.4, 26.3], [125.2, 29.7], [124.5, 33.4], [125.4, 35.3], [126.9, 35.7]],
        ]
    },
    {
        label: 'l: thin upstroke to the top of the loop, thick downstroke to the tail',
        width: 7,
        parts: [
            [[153.3, 30.9], [155.5, 31.2], [169.2, 18.4], [173.9, 12.3], [175.3, 9.1], [176.1, 4.9]],
            [[176, 4.8], [172.7, 4.5], [168.2, 8.4], [157.8, 21.7], [154.6, 27.2], [153.3, 30.8], [150.3, 33.9], [145.8, 41.3], [144.8, 46.9], [145.2, 48.7], [146.6, 49.8]],
        ]
    },
    {
        label: 'd: bowl, up the ascender, top-left flick, back down the stem',
        width: 7,
        parts: [
            [[179.8, 24.2], [174.9, 26.3], [168, 31.3], [163.2, 36.8], [162.4, 39.7], [162.6, 41.1], [163.7, 42.4], [167.6, 42.7], [173.3, 38], [177.5, 32.9], [179.6, 32.9], [182.6, 27.6], [185.1, 23.8], [188.2, 20.8], [190.8, 16.8], [193, 12.5], [197, 9.1]],
            [[197, 9.1], [191.6, 14.2], [188, 13.6]],
            [[190.8, 16.8], [185.1, 23.8], [182.6, 27.6], [179.6, 32.9], [177, 43.3], [177.2, 47.1], [178.9, 49.6]],
        ]
    },
    {
        label: 's: flick up to the top, then the spine down to the tail',
        width: 8,
        parts: [
            [[202.1, 29.4], [203.8, 25.9], [205.5, 24.3], [206.3, 21.3], [208, 19.1]],
            [[208, 19.1], [205.4, 21.1], [203.7, 21.2], [199.9, 22.4], [195.3, 25.8], [192.1, 29.3], [192, 31.9], [193.8, 33.1], [197.1, 33.9], [200.9, 35.5], [202.6, 37.8], [200.4, 39.9], [193, 41.9], [187.1, 43.6], [184.2, 46.7], [183.1, 49.9]],
        ]
    }
];
