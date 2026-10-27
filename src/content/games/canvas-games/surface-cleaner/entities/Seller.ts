import { Vector } from '../../core/Vector'
import type { SurfaceCleanerGame } from '../game'

const SELL_DISTANCE = 32
// 1 cell per millisecond
const SELL_RATE = 3

let TEXT_SIZE: { width: number; height: number } | null = null

export class Seller {
    position: Vector
    active: boolean

    constructor(position: Vector) {
        this.position = position
        this.active = false
    }

    update(elapsedTime: number, game: SurfaceCleanerGame) {
        this.active = false

        game.players.forEach((player) => {
            if (this.position.diff(player.position).magnitude() < SELL_DISTANCE) {
                if (player.store > 0) {
                    const sellAmount = Math.min(elapsedTime * SELL_RATE, player.store)
    
                    player.store -= sellAmount
                    game.money += sellAmount / 1000
                }

                this.active = true
            }
        })
    }

    draw(ctx: CanvasRenderingContext2D, topLeft: Vector) {
        ctx.fillStyle = 'red'
        ctx.beginPath()
        ctx.arc(
            this.position.x - topLeft.x,
            this.position.y - topLeft.y,
            SELL_DISTANCE / 2,
            0,
            2 * Math.PI
        )
        ctx.fill()

        ctx.fillStyle = 'black'
        ctx.font = '24px sans-serif'

        if (!TEXT_SIZE) {
            const measure = ctx.measureText('$')
            TEXT_SIZE = {
                width: measure.actualBoundingBoxRight - measure.actualBoundingBoxLeft,
                height: measure.actualBoundingBoxAscent - measure.actualBoundingBoxDescent,
            }
        }

        ctx.fillText('$', this.position.x - topLeft.x - TEXT_SIZE.width / 2, this.position.y - topLeft.y + TEXT_SIZE.height / 2)
    }
}
