import { Vector } from '../core/Vector'

const WORLD_WIDTH = 8
const WORLD_HEIGHT = 6

const BUNDLE_SIZE = 10

const CELL_SIZE = 40

export const FULL_WORLD_WIDTH = WORLD_WIDTH * BUNDLE_SIZE * CELL_SIZE
export const FULL_WORLD_HEIGHT = WORLD_HEIGHT * BUNDLE_SIZE * CELL_SIZE

type Cleared =
    /**
     * NOT cleared
     */
    | false
    /**
     * YES cleared
     */
    | true

class Cell {
    x: number
    y: number

    data: Cleared[][]

    constructor(x: number, y: number) {
        this.x = x
        this.y = y

        this.data = new Array(CELL_SIZE)
            .fill(0)
            .map(() => new Array(CELL_SIZE).fill(false))
    }

    draw(ctx: CanvasRenderingContext2D, offset: Vector): void {
        ctx.fillStyle = 'grey'
        for (let x = 0; x < CELL_SIZE; x++) {
            for (let y = 0; y < CELL_SIZE; y++) {
                if (!this.data[y][x]) {
                    ctx.fillRect(offset.x + x, offset.y + y, 1, 1)
                }
            }
        }
    }

    clear(topLeft: Vector, bottomRight: Vector): void {
        for (let x = Math.max(topLeft.x, 0); x < Math.min(CELL_SIZE, bottomRight.x); x++) {
            for (let y = Math.max(topLeft.y, 0); y < Math.min(CELL_SIZE, bottomRight.y); y++) {
                this.data[y][x] = true
            }
        }
    }
}

class Bundle {
    x: number
    y: number

    cells: (Cleared | Cell)[][]

    constructor(x: number, y: number) {
        this.x = x
        this.y = y

        this.cells = new Array(BUNDLE_SIZE)
            .fill(0)
            .map(() => new Array(BUNDLE_SIZE).fill(false))
    }

    forEachCell(topLeft: Vector, bottomRight: Vector, callback: (cell: Cleared | Cell, x: number, y: number) => void): void {
        const myLeftX = this.x * CELL_SIZE * BUNDLE_SIZE
        const myRightX = myLeftX + CELL_SIZE * BUNDLE_SIZE
        const myTopY = this.y * CELL_SIZE * BUNDLE_SIZE
        const myBottomY = myTopY + CELL_SIZE * BUNDLE_SIZE

        const startX = Math.floor(
            Math.max(myLeftX, Math.floor(topLeft.x)) / CELL_SIZE
        ) * CELL_SIZE
        const startY = Math.floor(
            Math.max(myTopY, Math.floor(topLeft.y)) / CELL_SIZE
        ) * CELL_SIZE

        for (let x = startX; x < myRightX && x < bottomRight.x; x += CELL_SIZE) {
            for (let y = startY; y < myBottomY && y < bottomRight.y; y += CELL_SIZE) {
                const cellX = Math.floor((x - myLeftX) / CELL_SIZE)
                const cellY = Math.floor((y - myTopY) / CELL_SIZE)

                const cell = this.cells[cellY][cellX]

                callback(cell, cellX, cellY)
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, topLeft: Vector, bottomRight: Vector): void {
        const myLeftX = this.x * CELL_SIZE * BUNDLE_SIZE
        const myTopY = this.y * CELL_SIZE * BUNDLE_SIZE

        this.forEachCell(topLeft, bottomRight, (cell, cellX, cellY) => {
            const currentX = myLeftX + cellX * CELL_SIZE
            const currentY = myTopY + cellY * CELL_SIZE

            const dX = currentX - topLeft.x
            const dY = currentY - topLeft.y
            
            if (cell === false) {
                ctx.fillStyle = 'white'
                ctx.fillRect(dX, dY, CELL_SIZE, CELL_SIZE)
            } else if (cell === true) {
                ctx.fillStyle = 'red'
                ctx.fillRect(dX, dY, CELL_SIZE, CELL_SIZE)
            } else {
                cell.draw(ctx, new Vector(dX, dY))
            }
        })

        ctx.strokeStyle = 'green'
        ctx.strokeRect(myLeftX - topLeft.x, myTopY - topLeft.y, CELL_SIZE * BUNDLE_SIZE, CELL_SIZE * BUNDLE_SIZE)
        ctx.lineWidth = 3
    }

    clear(topLeft: Vector, bottomRight: Vector): void {
        const myLeftX = this.x * CELL_SIZE * BUNDLE_SIZE
        const myTopY = this.y * CELL_SIZE * BUNDLE_SIZE

        this.forEachCell(topLeft, bottomRight, (cell, cellX, cellY) => {
            if (cell === true) {
                // Already cleared
                return
            }

            const myTopLeft = new Vector(topLeft.x - myLeftX - cellX * CELL_SIZE, topLeft.y - myTopY - cellY * CELL_SIZE)
            const myBottomRight = new Vector(bottomRight.x - myLeftX - cellX * CELL_SIZE, bottomRight.y - myTopY - cellY * CELL_SIZE)

            if (cell === false) {
                const c = new Cell(cellX, cellY)
                this.cells[cellY][cellX] = c

                c.clear(myTopLeft, myBottomRight)
            } else {
                cell.clear(myTopLeft, myBottomRight)
            }
        })
    }
}

export class WorldGrid {
    bundles: Bundle[][]

    constructor() {
        this.bundles = new Array(WORLD_HEIGHT)
            .fill(0)
            .map((_, rowIndex) => (
                new Array(WORLD_WIDTH)
                    .fill(0)
                    .map((_, colIndex) => new Bundle(colIndex, rowIndex))
            ))
    }

    private forEachBundle(topLeft: Vector, bottomRight: Vector, callback: (bundle: Bundle) => void): void {
        const leftX = Math.floor(topLeft.x / BUNDLE_SIZE / CELL_SIZE)
        const topY = Math.floor(topLeft.y / BUNDLE_SIZE / CELL_SIZE)
        const rightX = Math.ceil(bottomRight.x / BUNDLE_SIZE / CELL_SIZE)
        const bottomY = Math.ceil(bottomRight.y / BUNDLE_SIZE / CELL_SIZE)

        const startX = Math.max(0, leftX)
        const startY = Math.max(0, topY)

        const endX = Math.min(WORLD_WIDTH, rightX)
        const endY = Math.min(WORLD_HEIGHT, bottomY)

        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const bundle = this.bundles[y][x]

                if (!bundle) {
                    console.log(`(${x}, ${y})`, { leftX, topY, rightX, bottomY })
                }

                callback(bundle)
            }
        }
    }

    drawWorldGrid(ctx: CanvasRenderingContext2D, topLeft: Vector, bottomRight: Vector): void {
        this.forEachBundle(topLeft, bottomRight, (bundle) => {
            bundle.draw(ctx, topLeft, bottomRight)
        })
    }

    clearCells(topLeft: Vector, bottomRight: Vector): void {
        this.forEachBundle(topLeft, bottomRight, (bundle) => {
            bundle.clear(topLeft, bottomRight)
        })
    }
}
