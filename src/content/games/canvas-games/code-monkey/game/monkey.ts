import type { MonkeyGame, MonkeyCommand } from '.'

import { Vector } from '../../core/Vector'
import { type Animation, lerp, smoothStep } from './utils'

const idGenerator = () => {
    let nextId = 0

    return () => {
        return nextId++
    }
}

const monkeyIdGenerator = idGenerator()

const MOVE_DELAY = 250
const CLIMB_DELAY = 500
const FALL_DELAY = 150
const BONK_DELAY = 400
const PLANT_DELAY = 500
const HARVEST_DURATION = 300

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

    async executeCommand(command: MonkeyCommand): Promise<void> {
        switch (command) {
            case 'up':
            case 'left':
            case 'down':
            case 'right':
                if (this.canMove(command)) {
                    await this.move(command)
                } else {
                    await this.game.delay(BONK_DELAY)
                }
                return
            case 'plant':
                if (this.position.y === 0) {
                    this.game.plantTree(this.position.x)
                } else {
                    console.log('No plant', this.position.y)
                }
                await this.game.delay(PLANT_DELAY)
                return
        }
    }

    canMove(moveCommand: 'up' | 'down' | 'left' | 'right') {
        if (moveCommand === 'up') {
            if (this.position.y + 1 >= this.game.height) {
                return false
            }

            const tree = this.game.trees[this.position.x]

            if (!tree) {
                return false
            }

            return tree.height > this.position.y + 1
        } else if (moveCommand === 'down') {
            return this.position.y > 0
        } else if (moveCommand === 'left') {
            if (this.position.x === 0) {
                return false
            }

            return this.position.y === 0 ||
                (this.game.trees[this.position.x - 1]?.height ?? 0) > this.position.y
        } else if (moveCommand === 'right') {
            if (this.position.x === this.game.width - 1) {
                return false
            }

            return this.position.y === 0 ||
                (this.game.trees[this.position.x + 1]?.height ?? 0) > this.position.y
        } else {
            throw Error(`Unexpected canMove query: '${moveCommand}'`)
        }
    }

    canHarvest() {
        const tree = this.game.trees[this.position.x]

        return tree && tree.hasBanana && tree.height === this.position.y + 1
    }

    async harvest() {
        if (!this.canHarvest()) {
            await this.game.delay(HARVEST_DURATION)
            return false
        }

        const tree = this.game.trees[this.position.x]

        if (!tree || !tree.hasBanana) {
            throw Error('canHarvest returned true but there is no tree here!')
        }

        await this.game.delay(HARVEST_DURATION)
        if (tree.hasBanana) {
            tree.hasBanana = false
            this.game.addBanana()
            return true
        }
        return false
    }

    async report(n: number) {
        return await this.game.report(n)
    }

    async move(moveCommand: 'up' | 'down' | 'left' | 'right') {
        if (!this.canMove(moveCommand)) {
            await this.game.delay(BONK_DELAY)
        }

        const beforePos = this.position.copy()

        switch (moveCommand) {
            case 'up':
                if (this.position.y < this.game.height - 1) {
                    this.position.y += 1
                }
                break
            case 'down':
                if (this.position.y > 0) {
                    this.position.y -= 1
                }
                break
            case 'left':
                if (this.position.x > 0) {
                    this.position.x -= 1
                }
                break
            case 'right':
                if (this.position.x < this.game.width - 1) {
                    this.position.x += 1
                }
                break
        }

        const moveTiming = moveCommand === 'up'
            ? CLIMB_DELAY
            : moveCommand === 'down'
                ? FALL_DELAY
                : MOVE_DELAY

        if (this.position.x !== beforePos.x || this.position.y !== beforePos.y) {
            this.animation = {
                progress: 0,
                duration: moveCommand === 'down' ? moveTiming * 0.9 : moveTiming * 0.5,
                from: beforePos,
                to: this.position.copy(),
            }
        }
        await this.game.delay(moveTiming)
    }

    update(elapsedTime: number) {
        if (this.animation) {
            this.animation.progress += elapsedTime
            if (this.animation.progress >= this.animation.duration) {
                this.position.x = this.animation.to.x
                this.position.y = this.animation.to.y
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
        ctx.ellipse(
            (myX + 0.5) * scale,
            (this.game.height - (myY - 0.5) - 1) * scale,
            scale * 0.45,
            scale * 0.45,
            0,
            0,
            2 * Math.PI,
        )
        ctx.fill()
    }
}