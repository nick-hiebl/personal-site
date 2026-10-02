import { Vector } from '../core/Vector'

import type { Rect } from './types'
import { divideToFixedHeightGrid, divideToGrid, insetRect, randInt, rectToDetails } from './utils'

type Herb = {
    age: number
}

type Pot = Rect & PotData

type PotData = {
    herb?: Herb
    unlocked: boolean
    cost: number
    color: number
}

const NUM_PLANTS = 8
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

export class HerbGarden {
    spots: Pot[]
    width: number
    height: number

    tools: Rect[]
    seeds: Rect[]

    constructor(width: number, height: number) {
        this.width = width
        this.height = height

        const [toolSpace, plantSpace, seedSpace] = computeLayout(width, height)

        const squares = divideToGrid(plantSpace, NUM_PLANTS, PER_ROW, GAP)

        this.spots = squares.map((square, index) => {
            const pot: Pot = {
                ...square,
                unlocked: false,
                cost: 1,
                color: randInt(50, 90),
            }

            return pot
        })

        this.tools = divideToFixedHeightGrid(toolSpace, 4, 1, GAP, toolSpace.size.x)
        this.seeds = divideToFixedHeightGrid(seedSpace, 12, 2, GAP / 2, (seedSpace.size.x - GAP / 2) / 2)
    }

    updateState(deltaTime: number) {
        this.spots.forEach(spot => {
            if (spot.herb) {
                spot.herb.age += deltaTime
            }
        })
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.spots.forEach((spot, index) => {
            ctx.fillStyle = 'red'
    
            ctx.fillRect(...rectToDetails(spot))

            ctx.fillStyle = 'black'
            const measure = ctx.measureText(`${index}`)
            ctx.fillText(`${index}`, spot.position.x + spot.size.x / 2 - measure.width / 2, spot.position.y + 14)
        })

        ctx.lineWidth = 1

        this.tools.forEach((tool) => {
            ctx.strokeStyle = 'white'
            ctx.strokeRect(...rectToDetails(insetRect(tool, 0.5)))
        })

        this.seeds.forEach((seed) => {
            ctx.strokeStyle = 'white'
            ctx.strokeRect(...rectToDetails(insetRect(seed, 0.5)))
        })
    }
}
