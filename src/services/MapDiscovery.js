import { GameFactory } from "../factories/GameFactory";

const HORIZONTAL_MARGIN = 14;
const VERTICAL_MARGIN = 7;

export class MapDiscovery {
    constructor(worldSize, cellSize) {
        this.cellSize = Math.max(1, Math.floor(cellSize));
        this.reset(worldSize);
    }

    reset(worldSize) {
        this.worldSize = worldSize;
        this.cols = Math.ceil(worldSize.width / this.cellSize);
        this.rows = Math.ceil(worldSize.height / this.cellSize);
        this.visited = new Uint8Array(this.cols * this.rows);
    }

    markFromPlayer(player) {
        const minX = Math.max(
            0,
            player.x - GameFactory.GRID * HORIZONTAL_MARGIN,
        );
        const minY = Math.max(0, player.y - GameFactory.GRID * VERTICAL_MARGIN);
        const maxX = Math.min(
            this.worldSize.width,
            player.x + player.w + GameFactory.GRID * HORIZONTAL_MARGIN,
        );
        const maxY = Math.min(
            this.worldSize.height,
            player.y + player.h + GameFactory.GRID * VERTICAL_MARGIN,
        );

        this.markRect(minX, minY, maxX, maxY);
    }

    markRect(minX, minY, maxX, maxY) {
        if (maxX <= minX || maxY <= minY) {
            return;
        }

        const startCol = Math.max(0, Math.floor(minX / this.cellSize));
        const endCol = Math.min(
            this.cols - 1,
            Math.floor((maxX - 1) / this.cellSize),
        );
        const startRow = Math.max(0, Math.floor(minY / this.cellSize));
        const endRow = Math.min(
            this.rows - 1,
            Math.floor((maxY - 1) / this.cellSize),
        );

        for (let row = startRow; row <= endRow; row++) {
            const rowOffset = row * this.cols;
            for (let col = startCol; col <= endCol; col++) {
                this.visited[rowOffset + col] = 1;
            }
        }
    }

    forEachUndiscoveredCell(callback) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const index = row * this.cols + col;
                if (this.visited[index] === 1) {
                    continue;
                }

                const x = col * this.cellSize;
                const y = row * this.cellSize;
                const w = Math.min(this.cellSize, this.worldSize.width - x);
                const h = Math.min(this.cellSize, this.worldSize.height - y);
                callback(x, y, w, h);
            }
        }
    }

    snapshot() {
        const visitedIndices = [];
        for (let i = 0; i < this.visited.length; i++) {
            if (this.visited[i] === 1) {
                visitedIndices.push(i);
            }
        }

        return {
            cols: this.cols,
            rows: this.rows,
            visitedIndices,
        };
    }

    restore(snapshot) {
        if (!snapshot) {
            return;
        }

        if (snapshot.cols !== this.cols || snapshot.rows !== this.rows) {
            return;
        }

        this.visited.fill(0);
        for (const index of snapshot.visitedIndices ?? []) {
            if (index >= 0 && index < this.visited.length) {
                this.visited[index] = 1;
            }
        }
    }
}
