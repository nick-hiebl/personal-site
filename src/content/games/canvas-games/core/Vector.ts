export class Vector {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y)
    }

    diff(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y)
    }
}

export const approach = (current: number, target: number, step: number): number => {
    if (current > target) {
        return Math.max(target, current - step)
    } else {
        return Math.min(target, current + step)
    }
}
