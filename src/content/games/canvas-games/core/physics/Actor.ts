import { Vector } from '../Vector'

import type { Solid } from './Solid'
import type { AABB } from './types'

export class Actor {
    position: Vector
    size: Vector

    xRemainder: number
    yRemainder: number

    constructor(position: Vector, size: Vector) {
        this.position = position
        this.size = size

        this.xRemainder = 0
        this.yRemainder = 0
    }

    get center(): Vector {
        return new Vector(
            this.position.x + this.size.x / 2,
            this.position.y + this.size.y / 2,
        )
    }

    moveX(amount: number, solids: Solid[], onCollide?: () => void) {
        this.xRemainder += amount
        let step = Math.round(this.xRemainder)

        if (step !== 0) {
            this.xRemainder -= step
            const sign = Math.sign(step)

            while (step !== 0) {
                if (!this.collidesAt(this.position.add(new Vector(sign, 0)), solids)) {
                    this.position.x += sign
                    step -= sign
                } else {
                    onCollide?.()
                    break
                }
            }
        }
    }

    moveY(amount: number, solids: Solid[], onCollide?: () => void) {
        this.yRemainder += amount
        let step = Math.round(this.yRemainder)

        if (step !== 0) {
            this.yRemainder -= step
            const sign = Math.sign(step)

            while (step !== 0) {
                if (!this.collidesAt(this.position.add(new Vector(0, sign)), solids)) {
                    this.position.y += sign
                    step -= sign
                } else {
                    onCollide?.()
                    break
                }
            }
        }
    }

    collidesAt(newPosition: Vector, solids: Solid[]): boolean {
        const newSelf: AABB = { position: newPosition, size: this.size }

        return solids.some(solid => solid.collides(newSelf))
    }
}
