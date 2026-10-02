import { Vector } from '../core/Vector'

import type { Rect } from './types'
import { divideToGrid, insetRect, randInt, rectToDetails } from './utils'

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

export class HerbGarden {
    spots: Pot[]
    width: number
    height: number

    constructor(width: number, height: number) {
        this.width = width
        this.height = height

        const parentRect = insetRect({
            position: new Vector(0, 0),
            size: new Vector(width, height),
        }, 10)

        const squares = divideToGrid(parentRect, NUM_PLANTS, PER_ROW, GAP)

        this.spots = new Array(NUM_PLANTS).fill(0).map((_, index) => {
            const pot: Pot = {
                ...squares[index],
                unlocked: false,
                cost: 1,
                color: randInt(50, 90),
            }

            return pot
        })
    }

    updateState(deltaTime: number) {
        this.spots.forEach(spot => {
            if (spot.herb) {
                spot.herb.age += deltaTime
            }
        })
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.spots.forEach(spot => {
            ctx.fillStyle = 'red'
    
            ctx.fillRect(...rectToDetails(spot))
        })
    }
}
