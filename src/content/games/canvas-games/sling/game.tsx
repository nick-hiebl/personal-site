import { GameInstance } from '../core/GameInstance'
import { Actor } from '../core/physics/Actor'
import { Solid } from '../core/physics/Solid'
import { approach, Vector } from '../core/Vector'

const GRAVITY = 1.1
const STRENGTH = 0.02

const BAND_LENGTH = 100

const SPEED_RATE = 0.001

const FRICTION = 0.04

export class SlingGame extends GameInstance {
    player: Actor
    velocity: Vector
    hookPos: Vector | undefined

    solids: Solid[]

    constructor(canvas: HTMLCanvasElement) {
        super(canvas)

        const position = new Vector(this.canvas.width / 2, this.canvas.height / 2)
        this.player = new Actor(position, new Vector(16, 16))
        this.velocity = new Vector(0, 0)

        this.solids = [new Solid(new Vector(30, this.canvas.height - 30), new Vector(this.canvas.width - 60, 15))]
    }

    update(elapsedTime: number) {
        if (!this.hookPos && this.mouseDown && this.mousePos) {
            this.hookPos = new Vector(this.mousePos.x, this.mousePos.y)
        }

        if (this.hookPos && !this.mouseDown) {
            this.hookPos = undefined
        }

        if (this.hookPos) {
            const dist = this.hookPos.diff(this.player.position)
            const hookLength = Math.hypot(dist.x, dist.y)

            if (hookLength > BAND_LENGTH) {
                this.velocity.x += dist.x * (hookLength - BAND_LENGTH) / BAND_LENGTH * STRENGTH
                this.velocity.y += dist.y * (hookLength - BAND_LENGTH) / BAND_LENGTH * STRENGTH
            }
        }

        this.velocity.x = approach(this.velocity.x, 0, elapsedTime * FRICTION)
        this.velocity.y = approach(this.velocity.y, 0, elapsedTime * FRICTION)

        this.velocity.y += GRAVITY

        if (this.keys.get('Space')) {
            this.velocity.x = 0
            this.velocity.y = 0
        }

        this.player.moveX(this.velocity.x * elapsedTime * SPEED_RATE, this.solids)
        this.player.moveY(this.velocity.y * elapsedTime * SPEED_RATE, this.solids)
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.ctx.fillStyle = 'grey'
        this.solids.forEach(solid => {
            this.ctx.fillRect(solid.position.x, solid.position.y, solid.size.x, solid.size.y)
        })

        this.ctx.fillStyle = 'coral'
        this.ctx.fillRect(this.player.position.x, this.player.position.y, this.player.size.x, this.player.size.y)

        if (this.mousePos) {
            this.ctx.fillStyle = 'pink'
            this.ctx.fillRect(this.mousePos.x, this.mousePos.y, 10, 10)
        }

        if (this.hookPos) {
            this.ctx.strokeStyle = 'lightblue'
            this.ctx.beginPath()
            this.ctx.arc(this.hookPos.x, this.hookPos.y, 10, 0, 2 * Math.PI)
            this.ctx.stroke()
        }
    }
}
