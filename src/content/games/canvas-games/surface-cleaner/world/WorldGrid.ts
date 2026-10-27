import type { Vector } from '../../core/Vector'

import { Bundle, drawFrame } from './Bundle'
import { BUNDLE_SIZE, CELL_SIZE, FILL_COLOR, WORLD_HEIGHT, WORLD_WIDTH } from './constants'
import type { Cleared } from './types'

type BundleCallback = (bundle: Cleared | Bundle, x: number, y: number) => void

export class WorldGrid {
    bundles: (Cleared | Bundle)[][]

    constructor(startX: number, startY: number) {
        const startCol = Math.floor(startX / CELL_SIZE / BUNDLE_SIZE)
        const startRow = Math.floor(startY / CELL_SIZE / BUNDLE_SIZE)

        let placedStart = false

        this.bundles = new Array(WORLD_HEIGHT)
            .fill(0)
            .map((_, rowIndex) => (
                new Array(WORLD_WIDTH)
                    .fill(0)
                    .map((_, colIndex) => {
                        if (rowIndex === startRow && colIndex === startCol) {
                            placedStart = true
                            return Bundle.empty(colIndex, rowIndex)
                        }

                        return false
                    })
            ))

        if (!placedStart) {
            console.warn('Looked for', startRow, startCol, startX, startY)
            throw Error('Failed to place starting cell!')
        }
    }

    private forEachBundle(topLeft: Vector, bottomRight: Vector, callback: BundleCallback): void {
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

                callback(bundle, x, y)
            }
        }
    }

    drawWorldGrid(ctx: CanvasRenderingContext2D, topLeft: Vector, bottomRight: Vector): void {
        this.forEachBundle(topLeft, bottomRight, (bundle, x, y) => {
            if (bundle === false) {
                ctx.fillStyle = FILL_COLOR
                ctx.fillRect(
                    x * CELL_SIZE * BUNDLE_SIZE - topLeft.x,
                    y * CELL_SIZE * BUNDLE_SIZE - topLeft.y,
                    CELL_SIZE * BUNDLE_SIZE,
                    CELL_SIZE * BUNDLE_SIZE,
                )
                drawFrame(ctx, topLeft, x, y, false)
            } else if (bundle instanceof Bundle) {
                bundle.draw(ctx, topLeft, bottomRight)
            } else {
                drawFrame(ctx, topLeft, x, y, true)
            }
        })
    }

    clearCells(topLeft: Vector, bottomRight: Vector): number {
        let sumCleared = 0

        this.forEachBundle(topLeft, bottomRight, (bundle, x, y) => {
            if (bundle === true) {
                return
            }

            if (bundle === false) {
                const b = new Bundle(x, y)
                this.bundles[y][x] = b
            }

            const currentBundle = this.bundles[y][x]

            if (!currentBundle || currentBundle === true) {
                throw new Error('Current bundle does not exist???')
            }

            sumCleared += currentBundle.clear(topLeft, bottomRight)

            if (currentBundle.remaining === 0) {
                this.bundles[y][x] = true
            }
        })

        return sumCleared
    }
}
