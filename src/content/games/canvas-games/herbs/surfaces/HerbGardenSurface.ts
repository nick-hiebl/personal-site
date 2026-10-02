import { Vector } from '../../core/Vector';
import type { HerbGarden } from '../HerbGarden';
import { Surface, type SurfaceOptions } from '../Surface'
import type { CursorMode, Rect } from '../types';
import { divideToFixedHeightGrid, divideToGrid, insetRect, overlapsRect, rectToDetails } from '../utils';

type HerbGardenOptions = SurfaceOptions & {
    herbGarden: HerbGarden
}

const PER_ROW = 4
const GAP = 10

const computeLayout = (width: number, height: number): [Rect, Rect, Rect] => {
    let leftSpace = 25
    let rightSpace = 18 * 2 + GAP / 2
    const middleSpace = width - 4 * GAP - leftSpace - rightSpace

    const plantSize = Math.floor((middleSpace - (PER_ROW - 1) * GAP) / PER_ROW)
    const idealMiddle = plantSize * PER_ROW + GAP * (PER_ROW - 1)
    leftSpace += middleSpace - idealMiddle

    return [
        {
            position: new Vector(GAP, GAP),
            size: new Vector(leftSpace, height - 2 * GAP),
        },
        {
            position: new Vector(2 * GAP + leftSpace, GAP),
            size: new Vector(idealMiddle, height - 2 * GAP),
        },
        {
            position: new Vector(3 * GAP + leftSpace + idealMiddle, GAP),
            size: new Vector(rightSpace, height - 2 * GAP),
        },
    ]
}

export class HerbGardenSurface extends Surface {
    herbGarden: HerbGarden

    potPlaces: Rect[]
    toolPlaces: Rect[]
    seedPlaces: Rect[]

    constructor(name: string, position: Vector, size: Vector, { herbGarden, ...options }: HerbGardenOptions) {
        super(name, position, size, options)

        this.herbGarden = herbGarden

        const [toolSpace, plantSpace, seedSpace] = computeLayout(size.x, size.y)

        const squares = divideToGrid(plantSpace, herbGarden.pots.length, PER_ROW, GAP)

        this.potPlaces = squares

        this.toolPlaces = divideToFixedHeightGrid(toolSpace, 4, 1, GAP, toolSpace.size.x)
        this.seedPlaces = divideToFixedHeightGrid(seedSpace, 12, 2, GAP / 2, (seedSpace.size.x - GAP / 2) / 2)
    }

    override drawCore(ctx: CanvasRenderingContext2D) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 3
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 1

        ctx.fillStyle = '#883300'
        if (this.trigger) {
            ctx.fillRect(...rectToDetails(this.trigger))
        }

        ctx.fillRect(0, 0, this.size.x, this.size.y)

        if (!this.animation && !this.trigger?.enabled) {
            // Avoid rendering contents
            return
        }

        ctx.shadowColor = ''
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        this.potPlaces.forEach((spot, index) => {
            ctx.fillStyle = 'red'
    
            ctx.fillRect(...rectToDetails(spot))

            ctx.fillStyle = 'black'
            const measure = ctx.measureText(`${index}`)
            ctx.fillText(`${index}`, spot.position.x + spot.size.x / 2 - measure.width / 2, spot.position.y + 14)
        })

        ctx.lineWidth = 1

        this.toolPlaces.forEach((tool) => {
            ctx.strokeStyle = 'white'
            ctx.strokeRect(...rectToDetails(insetRect(tool, 0.5)))
        })

        this.seedPlaces.forEach((seed) => {
            ctx.strokeStyle = 'white'
            ctx.strokeRect(...rectToDetails(insetRect(seed, 0.5)))
        })
    }

    override cursorMode(mousePos: Vector, ctx: CanvasRenderingContext2D): CursorMode | 'done' | undefined {
        const localMouse = mousePos.diff(this.position)

        if (this.trigger && overlapsRect(this.trigger, localMouse)) {
            return 'point'
        }

        // Early exit for no-match
        if (!overlapsRect(this, localMouse)) {
            return
        }

        for (const [space, potIndex] of this.potPlaces.map<[Rect, number]>((space, index) => [space, index])) {
            if (overlapsRect(space, localMouse)) {
                if (this.herbGarden.pots[potIndex].unlocked) {
                    return 'point'
                }

                return 'cursor'
            }
        }

        for (const [space, toolIndex] of this.toolPlaces.map<[Rect, number]>((space, index) => [space, index])) {
            if (overlapsRect(space, localMouse)) {
                return 'point'
            }
        }

        for (const [space, seedIndex] of this.seedPlaces.map<[Rect, number]>((space, index) => [space, index])) {
            if (overlapsRect(space, localMouse)) {
                return 'point'
            }
        }

        // Checked above that this does overlap the surface, so it must be a non-interactive part of the board
        return 'cursor'
    }
}