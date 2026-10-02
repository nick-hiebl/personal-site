import type { Vector } from '../core/Vector'
import { DROPPED_SCALE } from './constants'

import { createDocumentImage } from './createDocument'
import type { Animation, DocumentI, SurfaceI } from './types'
import { fastStep, lerpVector, overlaps } from './utils'

export class Document implements DocumentI {
    position: Vector
    size: Vector
    surface: SurfaceI
    shape: HTMLCanvasElement | HTMLImageElement
    animation?: Animation
    interaction: DocumentI['interaction']

    constructor(position: Vector, size: Vector, surface: SurfaceI) {
        this.position = position
        this.size = size
        this.surface = surface

        this.shape = createDocumentImage(size.x, size.y)
    }

    update(elapsedTime: number) {
        if (this.animation) {
            this.animation.progress += elapsedTime

            if (this.animation.progress >= this.animation.duration) {
                this.position = this.animation.endPos
                this.animation = undefined
            } else {
                this.position = lerpVector(
                    fastStep(this.animation.progress / this.animation.duration),
                    this.animation.startPos,
                    this.animation.endPos,
                )
            }
        }
    }

    mouseEnter(mousePos: Vector, mouseDown: boolean) {
        if (this.interaction) {
            console.warn('Document.mouseEnter whilst already focused')
        }
        if (!mouseDown) {
            this.interaction = {
                hovered: true,
                grabbed: false,
                offset: this.position.diff(mousePos),
            }
        }
    }

    mouseOff() {
        this.interaction = undefined
    }

    cursorOverlaps(pos: Vector): boolean {
        const dist = pos.diff(this.position)

        return overlaps(dist, this.size.scale(this.interaction ? 1 : DROPPED_SCALE))
    }

    draw(ctx: CanvasRenderingContext2D) {
        const scale = this.interaction ? 1 : DROPPED_SCALE

        const { x: w, y: h } = this.size.scale(scale)

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = this.interaction
            ? this.interaction.grabbed
                ? 10
                : 5
            : 2

        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = this.interaction
            ? this.interaction.grabbed
                ? 5
                : 2
            : 1

        ctx.drawImage(this.shape, this.position.x - w / 2, this.position.y - h / 2, w, h)
    }
}
