import type { Vector } from '../../core/Vector'

import { Bundle } from './Bundle'
import { BUNDLE_SIZE, CELL_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from './constants'

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
