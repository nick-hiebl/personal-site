import { Vector } from '../Vector'

import type { AABB } from './types'

export class Solid implements AABB {
    position: Vector
    size: Vector

    constructor(position: Vector, size: Vector) {
        this.position = position
        this.size = size
    }

    collides(other: AABB): boolean {
        return this.position.x <= other.position.x + other.size.x &&
            other.position.x <= this.position.x + this.size.x &&
            this.position.y <= other.position.y + other.size.y &&
            other.position.y <= this.position.y + this.size.y
    }
}