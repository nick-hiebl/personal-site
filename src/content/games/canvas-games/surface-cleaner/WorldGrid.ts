import { Vector } from '../core/Vector'

const WORLD_WIDTH = 8
const WORLD_HEIGHT = 6

const BUNDLE_SIZE = 6

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

    remaining: number
    empty: boolean

    data: Cleared[][]

    constructor(x: number, y: number) {
        this.x = x
        this.y = y

        this.data = new Array(CELL_SIZE)
            .fill(0)
            .map(() => new Array(CELL_SIZE).fill(false))

        this.remaining = CELL_SIZE * CELL_SIZE
        this.empty = false
    }

    draw(ctx: CanvasRenderingContext2D, offset: Vector): void {
        ctx.fillStyle = 'white'
        for (let x = 0; x < CELL_SIZE; x++) {
            for (let y = 0; y < CELL_SIZE; y++) {
                if (!this.data[y][x]) {
                    ctx.fillRect(offset.x + x, offset.y + y, 1, 1)
                }
            }
        }
    }

    /**
     * Returns the number of spaces cleared
     */
    clear(topLeft: Vector, bottomRight: Vector): number {
        let cleared = 0

        for (let x = Math.max(topLeft.x, 0); x < Math.min(CELL_SIZE, bottomRight.x); x++) {
            for (let y = Math.max(topLeft.y, 0); y < Math.min(CELL_SIZE, bottomRight.y); y++) {
                if (!this.data[y][x]) {
                    cleared++
                    this.data[y][x] = true
                }
            }
        }

        this.remaining -= cleared

        if (this.remaining < 0) {
            throw Error('Cleared more than 100%')
        } else if (this.remaining === 0) {
            this.empty = true
        }

        return cleared
    }
}

class Bundle {
    x: number
    y: number

    cells: (Cleared | Cell)[][]

    /**
     * Indicates that the private canvas needs updating
     */
    private dirty: boolean = false

    full: boolean = true
    remaining: number

    private canvas: HTMLCanvasElement | null = null
    private ctx: CanvasRenderingContext2D | null = null

    constructor(x: number, y: number) {
        this.x = x
        this.y = y

        this.cells = new Array(BUNDLE_SIZE)
            .fill(0)
            .map(() => new Array(BUNDLE_SIZE).fill(false))

        this.remaining = BUNDLE_SIZE * BUNDLE_SIZE * CELL_SIZE * CELL_SIZE
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

        if (this.dirty) {
            if (this.canvas === null) {
                this.canvas = document.createElement('canvas')
                this.canvas.width = CELL_SIZE * BUNDLE_SIZE
                this.canvas.height = CELL_SIZE * BUNDLE_SIZE

                this.ctx = this.canvas.getContext('2d')!
            }

            if (!this.ctx) {
                console.warn('No CanvasRenderingContext2D in Bundle')
                return
            }

            this.ctx.fillStyle = 'black'
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

            for (let x = 0; x < BUNDLE_SIZE; x++) {
                for (let y = 0; y < BUNDLE_SIZE; y++) {
                    const cell = this.cells[y][x]

                    if (typeof cell === 'boolean') {
                        this.ctx.fillStyle = cell ? 'black' : 'white'
                        this.ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
                    } else {
                        cell.draw(this.ctx, new Vector(x * CELL_SIZE, y * CELL_SIZE))
                    }
                }
            }

            this.dirty = false
        }

        if (this.remaining === 0 || this.full) {
            ctx.fillStyle = this.full ? 'white' : 'black'
            ctx.fillRect(myLeftX - topLeft.x, myTopY - topLeft.y, CELL_SIZE * BUNDLE_SIZE, CELL_SIZE * BUNDLE_SIZE)

            this.drawFrame(ctx, topLeft)
            return
        }

        if (!this.canvas) {
            console.warn('No canvas present?')
            return
        }

        ctx.drawImage(this.canvas, myLeftX - topLeft.x, myTopY - topLeft.y, CELL_SIZE * BUNDLE_SIZE, CELL_SIZE * BUNDLE_SIZE)
        this.drawFrame(ctx, topLeft)
    }

    drawFrame(ctx: CanvasRenderingContext2D, topLeft: Vector): void {
        const myLeftX = this.x * CELL_SIZE * BUNDLE_SIZE
        const myTopY = this.y * CELL_SIZE * BUNDLE_SIZE

        const SHORT = 2
        const LONG = 8

        ctx.fillStyle = '#0088ff44'
        ctx.fillRect(myLeftX - topLeft.x, myTopY - topLeft.y, LONG, SHORT)
        ctx.fillRect(myLeftX - topLeft.x, myTopY - topLeft.y + SHORT, SHORT, LONG - SHORT)

        ctx.fillRect(myLeftX - topLeft.x + CELL_SIZE * BUNDLE_SIZE - LONG, myTopY - topLeft.y, LONG, SHORT)
        ctx.fillRect(myLeftX - topLeft.x + CELL_SIZE * BUNDLE_SIZE - SHORT, myTopY - topLeft.y + SHORT, SHORT, LONG - SHORT)

        ctx.fillRect(myLeftX - topLeft.x, myTopY - topLeft.y + CELL_SIZE * BUNDLE_SIZE - SHORT, LONG, SHORT)
        ctx.fillRect(myLeftX - topLeft.x, myTopY - topLeft.y + CELL_SIZE * BUNDLE_SIZE - LONG, SHORT, LONG - SHORT)

        ctx.fillRect(myLeftX - topLeft.x + CELL_SIZE * BUNDLE_SIZE - LONG, myTopY - topLeft.y + CELL_SIZE * BUNDLE_SIZE - SHORT, LONG, SHORT)
        ctx.fillRect(myLeftX - topLeft.x + CELL_SIZE * BUNDLE_SIZE - SHORT, myTopY - topLeft.y + CELL_SIZE * BUNDLE_SIZE - LONG, 3, LONG - SHORT)
    }

    /**
     * Returns the total number of spaces cleared
     */
    clear(topLeft: Vector, bottomRight: Vector): number {
        if (this.remaining === 0) {
            return 0
        }

        const myLeftX = this.x * CELL_SIZE * BUNDLE_SIZE
        const myTopY = this.y * CELL_SIZE * BUNDLE_SIZE

        let sumCleared = 0

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
            }
            
            const currentCell = this.cells[cellY][cellX]

            if (!currentCell || currentCell === true) {
                throw new Error('Current cell does not exist??')
            }

            sumCleared += currentCell.clear(myTopLeft, myBottomRight)

            if (currentCell.empty) {
                this.cells[cellY][cellX] = true
            }
        })

        if (sumCleared > 0) {
            this.full = false
            this.dirty = true

            this.remaining -= sumCleared

            if (this.remaining < 0) {
                throw Error('Cleared more than 100%')
            }

            if (this.remaining < CELL_SIZE * BUNDLE_SIZE * CELL_SIZE * BUNDLE_SIZE * 0.01) {
                sumCleared += this.remaining
                this.remaining = 0
            }

            if (this.remaining === 0) {
                this.canvas = null
                this.ctx = null
                this.cells = []
                this.dirty = false
            }
        }

        return sumCleared
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

    clearCells(topLeft: Vector, bottomRight: Vector): number {
        let sumCleared = 0

        this.forEachBundle(topLeft, bottomRight, (bundle) => {
            sumCleared += bundle.clear(topLeft, bottomRight)
        })

        return sumCleared
    }
}
