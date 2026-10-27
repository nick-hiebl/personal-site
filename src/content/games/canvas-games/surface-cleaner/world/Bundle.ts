import { Vector } from '../../core/Vector'

import { Cell } from './Cell'
import { BUNDLE_SIZE, CELL_SIZE, FILL_COLOR } from './constants'
import type { Cleared } from './types'

export const drawFrame = (ctx: CanvasRenderingContext2D, topLeft: Vector, x: number, y: number, clear: boolean): void => {
    const myLeftX = x * CELL_SIZE * BUNDLE_SIZE
    const myTopY = y * CELL_SIZE * BUNDLE_SIZE

    const SHORT = 2
    const LONG = 8

    ctx.fillStyle = clear ? '#00ff0044' : '#0088ff44'
    ctx.fillRect(myLeftX - topLeft.x, myTopY - topLeft.y, LONG, SHORT)
    ctx.fillRect(myLeftX - topLeft.x, myTopY - topLeft.y + SHORT, SHORT, LONG - SHORT)

    ctx.fillRect(myLeftX - topLeft.x + CELL_SIZE * BUNDLE_SIZE - LONG, myTopY - topLeft.y, LONG, SHORT)
    ctx.fillRect(myLeftX - topLeft.x + CELL_SIZE * BUNDLE_SIZE - SHORT, myTopY - topLeft.y + SHORT, SHORT, LONG - SHORT)

    ctx.fillRect(myLeftX - topLeft.x, myTopY - topLeft.y + CELL_SIZE * BUNDLE_SIZE - SHORT, LONG, SHORT)
    ctx.fillRect(myLeftX - topLeft.x, myTopY - topLeft.y + CELL_SIZE * BUNDLE_SIZE - LONG, SHORT, LONG - SHORT)

    ctx.fillRect(myLeftX - topLeft.x + CELL_SIZE * BUNDLE_SIZE - LONG, myTopY - topLeft.y + CELL_SIZE * BUNDLE_SIZE - SHORT, LONG, SHORT)
    ctx.fillRect(myLeftX - topLeft.x + CELL_SIZE * BUNDLE_SIZE - SHORT, myTopY - topLeft.y + CELL_SIZE * BUNDLE_SIZE - LONG, 3, LONG - SHORT)
}

export class Bundle {
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

    static empty(x: number, y: number): Bundle {
        const b = new Bundle(x, y)

        b.remaining = 0
        b.full = false
        b.cells = []

        return b
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

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            for (let x = 0; x < BUNDLE_SIZE; x++) {
                for (let y = 0; y < BUNDLE_SIZE; y++) {
                    const cell = this.cells[y][x]

                    if (cell === false) {
                        this.ctx.fillStyle = FILL_COLOR
                        this.ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
                    } else if (cell instanceof Cell) {
                        cell.draw(this.ctx, new Vector(x * CELL_SIZE, y * CELL_SIZE))
                    }
                }
            }

            this.dirty = false
        }

        if (this.remaining === 0) {
            this.drawFrame(ctx, topLeft)
            return
        }

        if (this.full) {
            ctx.fillStyle = FILL_COLOR
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
        drawFrame(ctx, topLeft, this.x, this.y, this.remaining === 0)
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
