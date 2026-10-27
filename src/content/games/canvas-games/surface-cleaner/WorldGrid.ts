import type { Vector } from '../core/Vector'

const WORLD_WIDTH = 800
const WORLD_HEIGHT = 600

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

    draw(ctx: CanvasRenderingContext2D, topLeft: Vector, bottomRight: Vector): void {

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

    draw(ctx: CanvasRenderingContext2D, topLeft: Vector, bottomRight: Vector): void {
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

        for (let x = startX; x < myRightX; x += CELL_SIZE) {
            for (let y = startY; y < myBottomY; y += CELL_SIZE) {
                const cellX = Math.floor((x - myLeftX) / CELL_SIZE)
                const cellY = Math.floor((y - myTopY) / CELL_SIZE)

                const cell = this.cells[cellY][cellX]

                if (cell === false) {
                    ctx.fillStyle = 'white'
                    const dX = x - topLeft.x
                    const dY = y - topLeft.y
                    ctx.fillRect(dX, dY, CELL_SIZE, CELL_SIZE)
                } else if (cell === true) {
                    ctx.fillStyle = 'red'
                    const dX = x - topLeft.x
                    const dY = y - topLeft.y
                    ctx.fillRect(dX, dY, CELL_SIZE, CELL_SIZE)
                } else {
                    cell.draw(ctx, topLeft, bottomRight)
                }
            }
        }

        ctx.strokeStyle = 'green'
        ctx.strokeRect(myLeftX - topLeft.x, myTopY - topLeft.y, CELL_SIZE * BUNDLE_SIZE, CELL_SIZE * BUNDLE_SIZE)
        ctx.lineWidth = 3
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

    drawWorldGrid(ctx: CanvasRenderingContext2D, topLeft: Vector, bottomRight: Vector): void {
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

                bundle.draw(ctx, topLeft, bottomRight)
            }
        }
    }
}
