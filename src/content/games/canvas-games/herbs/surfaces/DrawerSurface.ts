import { Surface } from '../Surface'
import { rectToDetails } from '../utils'

export class DrawerSurface extends Surface {
    override drawCore(ctx: CanvasRenderingContext2D) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 3
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 1

        ctx.fillStyle = '#883300'
        
        if (this.trigger) {
            ctx.fillRect(...rectToDetails(this.trigger))
        }

        ctx.fillRect(0, 0, this.size.x, this.size.y)

        ctx.beginPath()
        ctx.rect(0, 0, this.inset, this.size.y)
        ctx.rect(this.size.x - this.inset, 0, this.inset, this.size.y)
        ctx.rect(0, this.size.y - this.inset, this.size.x, this.inset)
        ctx.fill()
    }
}
