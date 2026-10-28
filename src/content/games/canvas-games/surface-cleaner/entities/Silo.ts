import { lerp } from '../../core/animation'
import type { Vector } from '../../core/Vector'
import type { SurfaceCleanerGame } from '../game'
import { SiloSettings } from '../settings/SiloSettings'

const ACTIVITY_RADIUS = 40

export class Silo {
    position: Vector
    store: number

    payloadTime: number
    storeBeforePayload: number

    constructor(position: Vector) {
        this.position = position
        this.store = 0

        this.payloadTime = 0
        this.storeBeforePayload = 0
    }

    update(elapsedTime: number, game: SurfaceCleanerGame) {
        if (this.store > 0) {
            const sellAmount = Math.min(elapsedTime * game.sellRate * SiloSettings.sellFraction, this.store)

            this.store -= sellAmount
            game.money += sellAmount * game.conversionRate / 1000
        }

        if (this.payloadTime > 0) {
            this.payloadTime -= elapsedTime
            return
        }

        game.players.forEach((player) => {
            if (this.position.diff(player.position).magnitude() < ACTIVITY_RADIUS) {
                if (player.store > 0) {
                    const transferAmount = Math.min(elapsedTime * SiloSettings.transferRate, player.store)

                    player.store -= transferAmount
                    this.store += transferAmount
                }
            }
        })
    }

    triggerAnimation(adding: number) {
        if (this.payloadTime > 0) {
            throw Error('Triggered animation on Silo already mid-animation')
        }

        this.storeBeforePayload = this.store
        this.store += adding
        this.payloadTime = SiloSettings.payloadTime
    }

    draw(ctx: CanvasRenderingContext2D, topLeft: Vector) {
        ctx.fillStyle = this.payloadTime > 0
            ? '#660066'
            : 'purple'
        ctx.beginPath()
        ctx.arc(
            this.position.x - topLeft.x,
            this.position.y - topLeft.y,
            ACTIVITY_RADIUS / 2,
            0,
            2 * Math.PI,
        )
        ctx.fill()

        const progressFraction = this.payloadTime > 0
            ? lerp(
                this.payloadTime / SiloSettings.payloadTime,
                this.store,
                this.storeBeforePayload
            ) / SiloSettings.storeCap
            : this.store / SiloSettings.storeCap

        ctx.fillStyle = '#00000044'
        ctx.beginPath()
        ctx.arc(
            this.position.x - topLeft.x,
            this.position.y - topLeft.y,
            ACTIVITY_RADIUS / 2.2,
            0,
            2 * Math.PI * progressFraction,
        )
        ctx.lineTo(this.position.x - topLeft.x, this.position.y - topLeft.y)
        ctx.fill()
    }
}
