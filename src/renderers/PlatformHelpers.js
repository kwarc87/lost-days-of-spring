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
        tLeft: left,
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

export function rightBottomEdgeCap3x3({
    tMid,
    tRight,
    mid,
    right,
    bMid,
    bRight,
}) {
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
