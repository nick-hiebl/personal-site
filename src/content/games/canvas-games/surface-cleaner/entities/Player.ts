import { Vector } from '../../core/Vector'

export class Player {
    position: Vector

    radius: number

    constructor(position: Vector) {
        this.position = position

        this.radius = 12
    }

    update(elapsedTime: number, movementInput: Vector) {
        this.position = this.position.add(movementInput.scale(elapsedTime / 5))
    }

    getBoundingBox(): [Vector, Vector] {
        return [
            new Vector(Math.ceil(this.position.x - this.radius), Math.ceil(this.position.y - this.radius)),
            new Vector(Math.floor(this.position.x + this.radius), Math.floor(this.position.y + this.radius)),
        ]
    }
}
