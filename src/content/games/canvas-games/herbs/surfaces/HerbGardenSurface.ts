import { Vector } from '../../core/Vector';
import ImgSeedSheet from '../assets/seed-sheet.png'
import ImgToolSheet from '../assets/tool-sheet.png'
import type { Document } from '../Document';
import type { HerbGarden } from '../HerbGarden';
import { Surface, type SurfaceOptions } from '../Surface'
import type { CursorMode, Rect } from '../types';
import { divideToFixedHeightGrid, divideToGrid, insetRect, overlapsRect, rectToDetails } from '../utils';
import { drawPot } from './plantArt';

type HerbGardenOptions = SurfaceOptions & {
    herbGarden: HerbGarden
}

const seedSheetImg = new Image()
seedSheetImg.src = ImgSeedSheet.src
const toolSheetImg = new Image()
toolSheetImg.src = ImgToolSheet.src

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

enum Tool {
    TROWEL = 0,
    WATERING_CAN = 1,
    SHEARS = 2,
    STAR = 3,
}

enum Seed {
    LEAF = 0,
    RED = 1,
    BLACK = 2,
    CLOVER = 3,
}

type ThingType = 'tool' | 'seed'

type Active = {
    type: ThingType
    index: number
}

export class HerbGardenSurface extends Surface {
    herbGarden: HerbGarden

    potPlaces: Rect[]
    toolPlaces: Rect[]
    seedPlaces: Rect[]

    active: Active | undefined

    clickBuffer: boolean

    constructor(name: string, position: Vector, size: Vector, { herbGarden, ...options }: HerbGardenOptions) {
        super(name, position, size, options)

        this.herbGarden = herbGarden

        const [toolSpace, plantSpace, seedSpace] = computeLayout(size.x, size.y)

        const squares = divideToGrid(plantSpace, herbGarden.pots.length, PER_ROW, GAP)

        this.potPlaces = squares

        this.toolPlaces = divideToFixedHeightGrid(toolSpace, 4, 1, GAP - 2, toolSpace.size.x)
        this.seedPlaces = divideToFixedHeightGrid(seedSpace, 12, 2, GAP / 2, (seedSpace.size.x - GAP / 2) / 2)

        this.clickBuffer = false
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

        this.potPlaces.forEach((spot, index) => {
            const pot = this.herbGarden.pots[index]
            if (!pot.unlocked) {
                return
            }

            const origin = new Vector(
                spot.position.x + spot.size.x / 2,
                spot.position.y + spot.size.y - 8,
            )

            drawPot(ctx, origin)

            if (pot.herb) {
                ctx.strokeStyle = 'green'
                ctx.lineWidth = 3
                ctx.beginPath()
                ctx.moveTo(origin.x, origin.y - 16)
                ctx.lineTo(origin.x, origin.y - 16 - pot.herb.age / 250)
                ctx.stroke()
            }
        })

        ctx.shadowColor = ''
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        ctx.lineWidth = 1

        ctx.drawImage(toolSheetImg, this.toolPlaces[0].position.x, this.toolPlaces[0].position.y)
        ctx.drawImage(seedSheetImg, this.seedPlaces[0].position.x, this.seedPlaces[0].position.y)

        if (this.active) {
            ctx.strokeStyle = 'white'
            if (this.active.type === 'tool') {
                ctx.strokeRect(...rectToDetails(insetRect(this.toolPlaces[this.active.index], 0.5)))
            } else {
                ctx.strokeRect(...rectToDetails(insetRect(this.seedPlaces[this.active.index], 0.5)))
            }
        }
    }

    override isActing(mouse: Vector, mouseDown: boolean, onDrop: (doc: Document) => void): boolean {
        const localMouse = mouse.diff(this.position)

        let doneSomething = false

        if (mouseDown && !this.clickBuffer) {
            for (const [space, toolIndex] of this.toolPlaces.map<[Rect, number]>((space, index) => [space, index])) {
                if (overlapsRect(space, localMouse)) {
                    if (this.active?.type === 'tool' && this.active.index === toolIndex) {
                        this.active = undefined
                    } else {
                        this.active = { type: 'tool', index: toolIndex }
                        doneSomething = true
                    }
                }
            }

            for (const [space, seedIndex] of this.seedPlaces.map<[Rect, number]>((space, index) => [space, index])) {
                if (overlapsRect(space, localMouse)) {
                    if (this.active?.type === 'seed' && this.active.index === seedIndex) {
                        this.active = undefined
                    } else {
                        this.active = { type: 'seed', index: seedIndex }
                        doneSomething = true
                    }
                }
            }

            if (this.active) {
                for (const [space, potIndex] of this.potPlaces.map<[Rect, number]>((space, index) => [space, index])) {
                    if (overlapsRect(space, localMouse)) {
                        const potData = this.herbGarden.pots[potIndex]

                        if (this.active.type === 'tool' && this.active.index === 0) {
                            if (potData.herb) {
                                potData.herb = undefined
                            }
                        } else if (this.active.type === 'seed' && this.active.index === 0) {
                            if (!potData.herb) {
                                potData.herb = { age: 0 }
                            }
                        }
                    }
                }
            }
        }

        this.clickBuffer = mouseDown

        return doneSomething || super.isActing(mouse, mouseDown, onDrop)
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
                const potData = this.herbGarden.pots[potIndex]
                if (potData.unlocked) {
                    if (potData.herb) {
                        ctx.fillStyle = 'black'
                        const tooltip = `Age: ${potData.herb?.age.toFixed(0)}`
                        const { width } = ctx.measureText(tooltip)
                        ctx.fillRect(mousePos.x, mousePos.y + 22, 10 + width, 25)
                        ctx.fillStyle = 'white'
                        ctx.fillText(tooltip, mousePos.x + 5, mousePos.y + 38)

                        if (this.active?.type === 'seed') {
                            return 'cursor'
                        }
                    }

                    if (this.active) {
                        return 'point'
                    }
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