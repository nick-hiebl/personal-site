import { Vector } from '../../core/Vector'

export class Player {
    position: Vector

    constructor(position: Vector) {
        this.position = position
    }

    update(elapsedTime: number, movementInput: Vector) {
        this.position = this.position.add(movementInput.scale(elapsedTime / 3))
    }
}
