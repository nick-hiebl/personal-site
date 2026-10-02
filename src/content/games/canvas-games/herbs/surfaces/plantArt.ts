import type { Vector } from '../../core/Vector'

export const drawPot = (ctx: CanvasRenderingContext2D, origin: Vector) => {
    const CLAY = '#b66a50'
    ctx.fillStyle = CLAY

    ctx.beginPath()
    ctx.ellipse(origin.x, origin.y, 10, 4, 0, 0, Math.PI)
    ctx.lineTo(origin.x - 12, origin.y - 14)
    ctx.ellipse(origin.x, origin.y - 17, 14, 5, 0, Math.PI, 2 * Math.PI)
    ctx.lineTo(origin.x + 12, origin.y - 14)
    ctx.fill()

    ctx.shadowColor = ''
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    ctx.fillStyle = '#662200'
    ctx.beginPath()
    ctx.ellipse(origin.x, origin.y - 15, 11, 4, 0, 0, 2 * Math.PI)
    ctx.fill()

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 1

    ctx.fillStyle = CLAY
    ctx.beginPath()
    ctx.ellipse(origin.x, origin.y - 14, 14, 5, 0, 0, Math.PI)
    ctx.ellipse(origin.x, origin.y - 19, 15, 5, 0, Math.PI, 0, true)
    ctx.fill()
}
