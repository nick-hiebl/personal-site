import type { MonkeyGame, MoveCommand } from '.'

import { Vector } from '../../core/Vector'
import { delay } from './utils'

const idGenerator = () => {
    let nextId = 0

    return () => {
        return nextId++
    }
}

const monkeyIdGenerator = idGenerator()

const MOVE_DELAY = 250

type Animation<T> = {
    progress: number
    duration: number
    from: T
    to: T
}

export const smoothStep = (t: number): number => 3 * t * t - 2 * t * t * t
export const fastStep = (t: number): number => t * (2 - t)

export const lerp = (t: number, a: number, b: number): number => {
    return (1 - t) * a + t * b
}

export class Monkey {
    id: number
    position: Vector
    game: MonkeyGame

    animation?: Animation<Vector>

    constructor(position: Vector, game: MonkeyGame) {
        this.id = monkeyIdGenerator()

        this.position = new Vector(position.x, position.y)

        this.game = game
    }

    async executeCommand(command: MoveCommand): Promise<void> {
        const beforePos = this.position.copy()
        let moved = false

        switch (command) {
            case 'up':
                if (this.position.y < this.game.height - 1) {
                    this.position.y += 1
                }
                moved = true
                break
            case 'down':
                if (this.position.y > 0) {
                    this.position.y -= 1
                }
                moved = true
                break
            case 'left':
                if (this.position.x > 0) {
                    this.position.x -= 1
                }
                moved = true
                break
            case 'right':
                if (this.position.x < this.game.width - 1) {
                    this.position.x += 1
                }
                moved = true
                break
        }
        if (moved) {
            if (this.position.x !== beforePos.x || this.position.y !== beforePos.y) {
                this.animation = {
                    progress: 0,
                    duration: MOVE_DELAY * 0.8,
                    from: beforePos,
                    to: this.position.copy(),
                }
            }
            await delay(MOVE_DELAY)
        }
    }

    update(elapsedTime: number) {
        if (this.animation) {
            this.animation.progress += elapsedTime
            if (this.animation.progress >= this.animation.duration) {
                this.animation = undefined
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, scale: number) {
        const myX = this.animation
            ? lerp(smoothStep(this.animation.progress / this.animation.duration), this.animation.from.x, this.animation.to.x)
            : this.position.x
        const myY = this.animation
            ? lerp(smoothStep(this.animation.progress / this.animation.duration), this.animation.from.y, this.animation.to.y)
            : this.position.y

        ctx.fillStyle = 'brown'
        ctx.beginPath()
        ctx.ellipse((myX + 0.5) * scale, (this.game.height - (myY - 0.5) - 1) * scale, scale / 2, scale / 2, 0, 0, 2 * Math.PI)
        ctx.fill()
    }
}