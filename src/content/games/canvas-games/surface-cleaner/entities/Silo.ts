import type { Vector } from '../../core/Vector'
import type { SurfaceCleanerGame } from '../game'
import { SiloSettings } from '../settings/SiloSettings'

const ACTIVITY_RADIUS = 40

export class Silo {
    position: Vector
    store: number

    constructor(position: Vector) {
        this.position = position
        this.store = 0
    }

    update(elapsedTime: number, game: SurfaceCleanerGame) {
        game.players.forEach((player) => {
            if (this.position.diff(player.position).magnitude() < ACTIVITY_RADIUS) {
                if (player.store > 0) {
                    const transferAmount = Math.min(elapsedTime * SiloSettings.transferRate, player.store)

                    player.store -= transferAmount
                    this.store += transferAmount
                }
            }
        })

        if (this.store > 0) {
            const sellAmount = Math.min(elapsedTime * game.sellRate * SiloSettings.sellFraction, this.store)

            this.store -= sellAmount
            game.money += sellAmount * game.conversionRate / 1000
        }
    }

    draw(ctx: CanvasRenderingContext2D, topLeft: Vector) {
        ctx.fillStyle = 'purple'
        ctx.beginPath()
        ctx.arc(
            this.position.x - topLeft.x,
            this.position.y - topLeft.y,
            ACTIVITY_RADIUS / 2,
            0,
            2 * Math.PI,
        )
        ctx.fill()

        ctx.fillStyle = '#440044'
        ctx.beginPath()
        ctx.arc(
            this.position.x - topLeft.x,
            this.position.y - topLeft.y,
            ACTIVITY_RADIUS / 2,
            0,
            2 * Math.PI * this.store / SiloSettings.storeCap,
        )
        ctx.lineTo(this.position.x - topLeft.x, this.position.y - topLeft.y)
        ctx.fill()
    }
}
