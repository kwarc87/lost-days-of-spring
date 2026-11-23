export function repeatHorizontal3x3(left, mid, right) {
    return {
        tLeft: left,
        tMid: mid,
        tRight: right,
        left,
        mid,
        right,
        bLeft: left,
        bMid: mid,
        bRight: right,
    };
}

// One-direction board strip; `x` is the source x of its left cap. In the tileset the
// "arrow + seam" unit is 32 px wide and sits 8 px off the 16 px grid, so mid tiles are cut at
// 8 px offsets and picked per column. An odd mid count reproduces the original strip; an even
// one adds a smooth half tile on each side (two mid tiles get a single centered arrow instead).
// Either way every arrow is complete and the strip stays symmetric.
export function oneDirectionBoard3x3({ x, y }) {
    const opening = { x: x + 16, y };
    const arrow = { x: x + 32, y };
    const seam = { x: x + 48, y };
    const smoothStart = { x: x + 8, y };
    const arrowLeft = { x: x + 24, y };
    const arrowRight = { x: x + 40, y };
    const closing = { x: x + 56, y };
    // Two mid tiles are too narrow for "seam + arrow + seam", so the arrow is centered without seams.
    const centeredArrowLeft = { x: x + 25, y };
    const centeredArrowRight = { x: x + 41, y };

    const mid = (col, cols) => {
        const index = col - 1;
        const count = cols - 2;
        if (count === 2) {
            return index === 0 ? centeredArrowLeft : centeredArrowRight;
        }
        if (count % 2 === 1) {
            if (index === 0) {
                return opening;
            }
            return index % 2 === 1 ? arrow : seam;
        }
        if (index === 0) {
            return smoothStart;
        }
        if (index === count - 1) {
            return closing;
        }
        return index % 2 === 1 ? arrowLeft : arrowRight;
    };

    // padLeft covers the dark tail of `closing` and the seam at the end of `centeredArrowRight`;
    // on other tiles it redraws the same pixels.
    return repeatHorizontal3x3({ x, y }, mid, { x: x + 64, y, padLeft: 2 });
}

export function repeatAllTiles3x3(tile) {
    return {
        tLeft: tile,
        tMid: tile,
        tRight: tile,
        left: tile,
        mid: tile,
        right: tile,
        bLeft: tile,
        bMid: tile,
        bRight: tile,
    };
}

// Only the top row gets a sprite; the remaining tiles are left empty.
export function repeatTopRowOnly3x3(tile) {
    return {
        tLeft: tile,
        tMid: tile,
        tRight: tile,
    };
}

export function topCap3x3({ tLeft, tMid, tRight, left, mid, right }) {
    return {
        tLeft,
        tMid,
        tRight,
        left,
        mid,
        right,
        bLeft: mid,
        bMid: mid,
        bRight: mid,
    };
}

export function bottomCap3x3({ left, mid, right, bLeft, bMid, bRight }) {
    return {
        tLeft: mid,
        tMid: mid,
        tRight: mid,
        left,
        mid,
        right,
        bLeft,
        bMid,
        bRight,
    };
}

export function leftCap3x3({ tLeft, tMid, left, mid, bLeft, bMid }) {
    return {
        tLeft,
        tMid,
        tRight: mid,
        left,
        mid,
        right: mid,
        bLeft,
        bMid,
        bRight: mid,
    };
}

export function rightCap3x3({ tMid, tRight, mid, right, bMid, bRight }) {
    return {
        tLeft: mid,
        tMid,
        tRight,
        left: mid,
        mid,
        right,
        bLeft: mid,
        bMid,
        bRight,
    };
}

export function topLeftEdgeCap3x3({ tLeft, tMid, tRight, left, mid, right }) {
    return {
        tLeft,
        tMid,
        tRight,
        left,
        mid,
        right,
        bLeft: left,
        bMid: mid,
        bRight: mid,
    };
}

export function topRightEdgeCap3x3({ tLeft, tMid, tRight, left, mid, right }) {
    return {
        tLeft,
        tMid,
        tRight,
        left,
        mid,
        right,
        bLeft: mid,
        bMid: mid,
        bRight: right,
    };
}

export function bottomLeftEdgeCap3x3({ left, mid, right, bLeft, bMid, bRight }) {
    return {
        tLeft: left,
        tMid: mid,
        tRight: mid,
        left,
        mid,
        right,
        bLeft,
        bMid,
        bRight,
    };
}

export function bottomRightEdgeCap3x3({ left, mid, right, bLeft, bMid, bRight }) {
    return {
        tLeft: mid,
        tMid: mid,
        tRight: right,
        left,
        mid,
        right,
        bLeft,
        bMid,
        bRight,
    };
}

export function leftBottomEdgeCap3x3({ tLeft, tMid, left, mid, bLeft, bMid }) {
    return {
        tLeft,
        tMid,
        tRight: mid,
        left,
        mid,
        right: mid,
        bLeft,
        bMid,
        bRight: bMid,
    };
}

export function leftTopEdgeCap3x3({ tLeft, tMid, left, mid, bLeft, bMid }) {
    return {
        tLeft,
        tMid,
        tRight: tMid,
        left,
        mid,
        right: mid,
        bLeft,
        bMid,
        bRight: mid,
    };
}

export function rightBottomEdgeCap3x3({ tMid, tRight, mid, right, bMid, bRight }) {
    return {
        tLeft: mid,
        tMid,
        tRight,
        left: mid,
        mid,
        right,
        bLeft: bMid,
        bMid,
        bRight,
    };
}

export function rightTopEdgeCap3x3({ tMid, tRight, mid, right, bMid, bRight }) {
    return {
        tLeft: tMid,
        tMid,
        tRight,
        left: mid,
        mid,
        right,
        bLeft: mid,
        bMid,
        bRight,
    };
}

export function horizontalConnector3x3({ tMid, mid, bMid }) {
    return {
        tLeft: tMid,
        tMid,
        tRight: tMid,
        left: mid,
        mid,
        right: mid,
        bLeft: bMid,
        bMid,
        bRight: bMid,
    };
}

export function horizontalConnectorRightClean3x3({ tMid, mid, bMid }) {
    return {
        tLeft: tMid,
        tMid,
        tRight: mid,
        left: mid,
        mid,
        right: mid,
        bLeft: bMid,
        bMid,
        bRight: mid,
    };
}

export function horizontalConnectorLeftClean3x3({ tMid, mid, bMid }) {
    return {
        tLeft: mid,
        tMid,
        tRight: tMid,
        left: mid,
        mid,
        right: mid,
        bLeft: mid,
        bMid,
        bRight: bMid,
    };
}

export function horizontalConnectorTopClean3x3({ tMid, mid, bMid }) {
    return {
        tLeft: mid,
        tMid,
        tRight: mid,
        left: mid,
        mid,
        right: mid,
        bLeft: bMid,
        bMid,
        bRight: bMid,
    };
}

export function horizontalConnectorBottomClean3x3({ tMid, mid, bMid }) {
    return {
        tLeft: tMid,
        tMid,
        tRight: tMid,
        left: mid,
        mid,
        right: mid,
        bLeft: mid,
        bMid,
        bRight: mid,
    };
}

export function horizontalConnectorBothClean3x3({ tMid, mid, bMid }) {
    return {
        tLeft: mid,
        tMid,
        tRight: mid,
        left: mid,
        mid,
        right: mid,
        bLeft: mid,
        bMid,
        bRight: mid,
    };
}

export function verticalConnector3x3({ left, mid, right }) {
    return {
        tLeft: left,
        tMid: mid,
        tRight: right,
        left,
        mid,
        right,
        bLeft: left,
        bMid: mid,
        bRight: right,
    };
}

export function verticalConnector3x3TopClean({ left, mid, right }) {
    return {
        tLeft: mid,
        tMid: mid,
        tRight: mid,
        left,
        mid,
        right,
        bLeft: left,
        bMid: mid,
        bRight: right,
    };
}

export function verticalConnector3x3BottomClean({ left, mid, right }) {
    return {
        tLeft: left,
        tMid: mid,
        tRight: right,
        left,
        mid,
        right,
        bLeft: mid,
        bMid: mid,
        bRight: mid,
    };
}

export function verticalConnector3x3LeftClean({ left, mid, right }) {
    return {
        tLeft: mid,
        tMid: mid,
        tRight: right,
        left,
        mid,
        right,
        bLeft: mid,
        bMid: mid,
        bRight: right,
    };
}

export function verticalConnector3x3RightClean({ left, mid, right }) {
    return {
        tLeft: left,
        tMid: mid,
        tRight: mid,
        left,
        mid,
        right,
        bLeft: left,
        bMid: mid,
        bRight: mid,
    };
}

export function verticalConnector3x3BothClean({ left, mid, right }) {
    return {
        tLeft: mid,
        tMid: mid,
        tRight: mid,
        left,
        mid,
        right,
        bLeft: mid,
        bMid: mid,
        bRight: mid,
    };
}

export function onlyLeft({ left, mid }) {
    return {
        tLeft: left,
        tMid: mid,
        tRight: mid,
        left,
        mid,
        right: mid,
        bLeft: left,
        bMid: mid,
        bRight: mid,
    };
}

export function onlyLeftClean({ left, mid }) {
    return {
        tLeft: mid,
        tMid: mid,
        tRight: mid,
        left,
        mid,
        right: mid,
        bLeft: mid,
        bMid: mid,
        bRight: mid,
    };
}

export function onlyRight({ mid, right }) {
    return {
        tLeft: mid,
        tMid: mid,
        tRight: right,
        left: mid,
        mid,
        right,
        bLeft: mid,
        bMid: mid,
        bRight: right,
    };
}

export function onlyRightClean({ mid, right }) {
    return {
        tLeft: mid,
        tMid: mid,
        tRight: mid,
        left: mid,
        mid,
        right,
        bLeft: mid,
        bMid: mid,
        bRight: mid,
    };
}

export function onlyRightTopClean({ mid, right }) {
    return {
        tLeft: mid,
        tMid: mid,
        tRight: mid,
        left: mid,
        mid,
        right,
        bLeft: mid,
        bMid: mid,
        bRight: right,
    };
}

export function onlyRightBottomClean({ mid, right }) {
    return {
        tLeft: mid,
        tMid: mid,
        tRight: right,
        left: mid,
        mid,
        right,
        bLeft: mid,
        bMid: mid,
        bRight: mid,
    };
}

export function onlyLeftTopClean({ left, mid }) {
    return {
        tLeft: mid,
        tMid: mid,
        tRight: mid,
        left,
        mid,
        right: mid,
        bLeft: left,
        bMid: mid,
        bRight: mid,
    };
}

export function onlyLeftBottomClean({ left, mid }) {
    return {
        tLeft: left,
        tMid: mid,
        tRight: mid,
        left,
        mid,
        right: mid,
        bLeft: mid,
        bMid: mid,
        bRight: mid,
    };
}

export function onlyBottom({ mid, bMid }) {
    return {
        tLeft: mid,
        tMid: mid,
        tRight: mid,
        left: mid,
        mid,
        right: mid,
        bLeft: bMid,
        bMid,
        bRight: bMid,
    };
}

export function onlyBottomClean({ mid, bMid }) {
    return {
        tLeft: mid,
        tMid: mid,
        tRight: mid,
        left: mid,
        mid,
        right: mid,
        bLeft: mid,
        bMid,
        bRight: mid,
    };
}

export function onlyTop({ mid, tMid }) {
    return {
        tLeft: tMid,
        tMid,
        tRight: tMid,
        left: mid,
        mid,
        right: mid,
        bLeft: mid,
        bMid: mid,
        bRight: mid,
    };
}

export function onlyTopClean({ mid, tMid }) {
    return {
        tLeft: mid,
        tMid,
        tRight: mid,
        left: mid,
        mid,
        right: mid,
        bLeft: mid,
        bMid: mid,
        bRight: mid,
    };
}

export function onlyTopLeftClean({ mid, tMid }) {
    return {
        tLeft: mid,
        tMid,
        tRight: tMid,
        left: mid,
        mid,
        right: mid,
        bLeft: mid,
        bMid: mid,
        bRight: mid,
    };
}

export function onlyTopRightClean({ mid, tMid }) {
    return {
        tLeft: tMid,
        tMid,
        tRight: mid,
        left: mid,
        mid,
        right: mid,
        bLeft: mid,
        bMid: mid,
        bRight: mid,
    };
}
