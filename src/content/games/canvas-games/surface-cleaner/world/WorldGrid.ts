import { Vector } from '../../core/Vector'

import { Bundle } from './Bundle'
import { BUNDLE_SIZE, CELL_SIZE, FILL_COLOR, WORLD_HEIGHT, WORLD_WIDTH } from './constants'
import type { Cleared } from './types'

type BundleCallback = (bundle: Cleared | Bundle, x: number, y: number) => void

const BUNDLE_SCALE = CELL_SIZE * BUNDLE_SIZE

type LayerDescription = {
    topLeft: Vector
    bottomRight: Vector
    excluded?: Vector
    color: string
}

type LayerState = {
    bundles: (Cleared | Bundle)[][]
    remainingBundles: number
}

const createBundlesForLayer = (layer: LayerDescription): LayerState => {
    let placedStart = false

    let remainingBundles = 0

    const bundles = new Array(WORLD_HEIGHT)
        .fill(0)
        .map((_, rowIndex) => (
            new Array(WORLD_WIDTH)
                .fill(0)
                .map((_, colIndex) => {
                    if (layer.excluded && !placedStart) {
                        if (colIndex === layer.excluded.x && rowIndex === layer.excluded.y) {
                            placedStart = true
                            return Bundle.empty(colIndex, rowIndex)
                        }
                    }

                    const insideBound = layer.topLeft.x <= colIndex && colIndex < layer.bottomRight.x &&
                        layer.topLeft.y <= rowIndex && rowIndex < layer.bottomRight.y

                    if (insideBound) {
                        remainingBundles++
                        return false
                    }

                    return true
                })
        ))

    if (layer.excluded && !placedStart) {
        console.warn('Looked for', layer.excluded)
        throw Error('Failed to place starting cell!')
    }

    return {
        bundles,
        remainingBundles,
    }
}

export class WorldGrid {
    bundles: (Cleared | Bundle)[][]
    remainingBundles: number

    /**
     * Key is 2d-array index corresponding to the bundle. Value is the owner id
     */
    assignments: Map<number, number>

    noAssignmentsAvailable: boolean

    currentLayerIndex: number
    layers: LayerDescription[]

    constructor(layers: LayerDescription[]) {
        this.layers = layers
        this.currentLayerIndex = 0

        const { bundles, remainingBundles } = createBundlesForLayer(layers[0])

        this.bundles = bundles
        this.remainingBundles = remainingBundles

        this.assignments = new Map()

        this.noAssignmentsAvailable = false
    }

    private forEachBundle(topLeft: Vector, bottomRight: Vector, callback: BundleCallback): void {
        const leftX = Math.floor(topLeft.x / BUNDLE_SCALE)
        const topY = Math.floor(topLeft.y / BUNDLE_SCALE)
        const rightX = Math.ceil(bottomRight.x / BUNDLE_SCALE)
        const bottomY = Math.ceil(bottomRight.y / BUNDLE_SCALE)

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
                    x * BUNDLE_SCALE - topLeft.x,
                    y * BUNDLE_SCALE - topLeft.y,
                    BUNDLE_SCALE,
                    BUNDLE_SCALE,
                )
            } else if (bundle instanceof Bundle) {
                bundle.draw(ctx, topLeft, bottomRight)
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

            const thisBundleCleared = currentBundle.clear(topLeft, bottomRight)
            sumCleared += thisBundleCleared

            if (currentBundle.remaining === 0) {
                if (thisBundleCleared > 0) {
                    this.remainingBundles--
                }

                this.bundles[y][x] = true
            }
        })

        return sumCleared
    }

    findAssignment(position: Vector, ownerId: number): Vector | undefined {
        if (this.noAssignmentsAvailable || this.remainingBundles === 0) {
            return
        }

        const myBoxX = Math.floor(position.x / BUNDLE_SCALE)
        const myBoxY = Math.floor(position.y / BUNDLE_SCALE)

        let n = 0
        while (n < WORLD_WIDTH) {
            const candidates = new Set<number>()
            let anyInBounds = false

            const addCandidate = (x: number, y: number) => {
                if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT) {
                    return
                }

                anyInBounds = true
                
                const index = x + y * WORLD_WIDTH

                if (candidates.has(index)) {
                    return
                }

                if (this.bundles[y][x] === true || this.assignments.has(index)) {
                    return
                }

                candidates.add(index)
            }

            for (let i = -n; i <= n; i++) {
                // Lazily iterate all four edges of a [-n, n] box centered on the given position
                addCandidate(myBoxX - n, myBoxY + i)
                addCandidate(myBoxX + n, myBoxY + i)
                addCandidate(myBoxX + i, myBoxY - n)
                addCandidate(myBoxX + i, myBoxY + n)
            }

            if (!anyInBounds) {
                this.noAssignmentsAvailable = true
                return
            }

            if (candidates.size === 0) {
                n++
                continue
            }

            const candidatesArray = Array.from(candidates)

            const closestCandidate = candidatesArray
                .reduce<{ dist: number; candidate: number }>(
                    ({ dist: bestDist, candidate: bestCandidate }, current) => {
                        const currentX = current % WORLD_WIDTH
                        const currentY = Math.floor(current / WORLD_WIDTH)

                        const closestX = Math.max(Math.min(position.x, (currentX + 1) * BUNDLE_SCALE), currentX * BUNDLE_SCALE)
                        const closestY = Math.max(Math.min(position.y, (currentY + 1) * BUNDLE_SCALE), currentY * BUNDLE_SCALE)

                        const dist = new Vector(closestX, closestY).diff(position).magnitude()

                        if (dist < bestDist) {
                            return { dist, candidate: current }
                        } else {
                            return { dist: bestDist, candidate: bestCandidate }
                        }
                    },
                    { dist: Infinity, candidate: candidatesArray[0] },
                )

            this.assignments.set(closestCandidate.candidate, ownerId)

            return new Vector(
                closestCandidate.candidate % WORLD_WIDTH,
                Math.floor(closestCandidate.candidate / WORLD_WIDTH),
            ).scale(BUNDLE_SCALE)
        }
    }

    isComplete(vector: Vector): boolean {
        const tX = Math.floor(vector.x / BUNDLE_SCALE)
        const tY = Math.floor(vector.y / BUNDLE_SCALE)

        if (this.bundles[tY][tX] === true) {
            this.assignments.delete(tX + tY * WORLD_WIDTH)
            return true
        }
        return false
    }

    isCompleteXY(x: number, y: number): boolean {
        return this.bundles[y][x] === true
    }

    goToNextLayer(): boolean {
        if (this.currentLayerIndex + 1 >= this.layers.length) {
            return false
        }

        const newIndex = this.currentLayerIndex + 1
        const currentLayer = this.layers[newIndex]
        this.currentLayerIndex = newIndex

        if (!currentLayer) {
            throw Error(`Next layer should exist, but for some reason does not! '${newIndex}'`)
        }

        const { bundles, remainingBundles } = createBundlesForLayer(currentLayer)

        this.bundles = bundles
        this.remainingBundles = remainingBundles

        this.noAssignmentsAvailable = this.remainingBundles === 0
        this.assignments = new Map()

        return true
    }

    currentLayerColor() {
        return this.layers[this.currentLayerIndex]?.color ?? 'black'
    }

    nextLayerColor() {
        return this.layers[this.currentLayerIndex + 1]?.color ?? 'black'
    }
}
