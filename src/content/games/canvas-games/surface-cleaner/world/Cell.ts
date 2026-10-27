import type { Vector } from '../../core/Vector'

import { CELL_SIZE } from './constants'
import type { Cleared } from './types'

export class Cell {
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
