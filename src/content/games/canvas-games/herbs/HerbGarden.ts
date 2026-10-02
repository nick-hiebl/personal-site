import { Vector } from '../core/Vector'

import type { Rect } from './types'
import { divideToFixedHeightGrid, divideToGrid, insetRect, randInt, rectToDetails } from './utils'

type Herb = {
    age: number
}

type PotData = {
    herb?: Herb
    unlocked: boolean
    cost: number
    color: number
}

const NUM_PLANTS = 8

export class HerbGarden {
    pots: PotData[]
    width: number
    height: number

    constructor(width: number, height: number) {
        this.width = width
        this.height = height

        this.pots = new Array(NUM_PLANTS).fill(0).map(() => ({
            unlocked: false,
            cost: 1,
            color: 1,
        }))
    }

    updateState(deltaTime: number) {
        this.pots.forEach(spot => {
            if (spot.herb) {
                spot.herb.age += deltaTime
            }
        })
    }
}
