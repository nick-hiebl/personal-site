import { Vector } from '../core/Vector'
import { DRAWER_SPEED, SLIDE_TO_SURFACE } from './constants'

import type { Document } from './Document'

import type { Animation, CursorMode, DocumentI, SurfaceI } from './types'
import { clampToSurface, createId, lerpVector, overlaps, overlapsRect, rectToDetails, smoothStep } from './utils'

export type SurfaceOptions = {
    inset?: number
    noDrop?: boolean
}

export class Surface implements SurfaceI {
    id: number
    name: string
    position: Vector
    size: Vector
    inset: number
    documents?: Document[]
    animation?: Animation

    trigger?: SurfaceI['trigger']

    constructor(name: string, position: Vector, size: Vector, options: SurfaceOptions = {}) {
        this.id = createId()
        this.name = name
        this.position = position
        this.size = size
        this.documents = options.noDrop ? undefined : []

        this.inset = options.inset ?? 0
    }

    update(elapsedTime: number) {
        if (this.animation) {
            this.animation.progress += elapsedTime

            this.documents?.forEach(doc => {
                doc.interaction = undefined
            })

            if (this.animation.progress >= this.animation.duration) {
                this.position = this.animation.endPos
                this.animation = undefined
            } else {
                this.position = lerpVector(
                    smoothStep(this.animation.progress / this.animation.duration),
                    this.animation.startPos,
                    this.animation.endPos,
                )
            }
        }

        this.documents?.forEach(document => {
            document.update(elapsedTime)
        })
    }

    drop(document: Document) {
        if (!this.documents) {
            if (document.surface instanceof Surface) {
                document.surface.drop(document)
            } else {
                console.warn('Dropping document from non-Surface surface')
            }
            return
        }

        const currentSurface = document.surface
        document.surface = this

        if (currentSurface !== this) {
            currentSurface.documents = currentSurface.documents!.filter(doc => doc !== document)

            this.documents.push(document)
        }

        const localPosition = currentSurface === this
            ? document.position
            : document.position
                .add(currentSurface.position)
                .diff(this.position)

        const targetPos = clampToSurface(this, localPosition.add(this.position), document.size)

        if (targetPos.x === localPosition.x && targetPos.y === localPosition.y) {
            document.position = localPosition
        } else {
            document.animation = {
                startPos: localPosition,
                endPos: targetPos,
                duration: SLIDE_TO_SURFACE,
                progress: 0,
            }
        }
    }

    isActing(mouse: Vector, mouseDown: boolean, onDrop: (doc: Document) => void): boolean {
        // console.log('Checking acting', this.name)
        const localMouse = mouse.diff(this.position)

        let cursorTaken = false

        if (this.animation) {
            this.rest()

            return this.documents?.some(doc => doc.cursorOverlaps(localMouse)) ||
                (this.trigger && overlapsRect(this.trigger, localMouse)) ||
                overlapsRect(this, mouse)
        }

        if (this.documents) {
            const active = this.documents.find(doc => doc.interaction)

            if (active) {
                const activeInteraction = active.interaction!

                if (activeInteraction.grabbed) {
                    cursorTaken = true

                    if (mouseDown) {
                        active.position = mouse.add(activeInteraction.offset)
                    } else {
                        active.interaction = {
                            hovered: true,
                            grabbed: false,
                            offset: new Vector(0, 0),
                        }

                        onDrop(active)
                    }
                } else if (active.cursorOverlaps(localMouse)) {
                    cursorTaken = true

                    if (mouseDown) {
                        activeInteraction.offset = active.position.diff(mouse)
                        activeInteraction.grabbed = true

                        this.documents = this.documents.filter(d => d !== active)
                        this.documents.push(active)
                    }
                } else {
                    active.mouseOff()
                }
            }

            if (!cursorTaken) {
                const overlappedDocument = this.documents.findLast(doc => doc.cursorOverlaps(localMouse))

                if (overlappedDocument) {
                    cursorTaken = true
                    overlappedDocument.mouseEnter(localMouse, mouseDown)
                }
            }
        }

        if (!cursorTaken && this.trigger) {
            if (overlapsRect(this.trigger, localMouse)) {
                cursorTaken = true

                if (this.trigger.hovered && mouseDown) {
                    this.animation = this.trigger.enabled
                        ? {
                            startPos: this.position,
                            endPos: this.position.diff(this.trigger.parentShift),
                            duration: this.trigger.animSpeed,
                            progress: 0,
                        }
                        : {
                            startPos: this.position,
                            endPos: this.position.add(this.trigger.parentShift),
                            duration: this.trigger.animSpeed,
                            progress: 0,
                        }

                    this.trigger.enabled = !this.trigger.enabled
                } else if (!this.trigger.hovered && !mouseDown) {
                    this.trigger.hovered = true
                }
            } else {
                this.trigger.hovered = false
            }
        }

        if (!cursorTaken) {
            this.rest()
        }

        if (overlapsRect(this, mouse)) {
            cursorTaken = true
        }

        return cursorTaken
    }

    cursorMode(mousePos: Vector, _ctx: CanvasRenderingContext2D): CursorMode | 'done' | undefined {
        const localMouse = mousePos.diff(this.position)

        if (this.documents) {
            const active = this.documents.findLast(doc => doc.interaction)

            if (active) {
                if (active.interaction!.grabbed) {
                    return 'grabbing'
                } else {
                    return 'can-grab'
                }
            }
        }

        if (this.trigger && overlapsRect(this.trigger, localMouse)) {
            return 'point'
        } else if (overlapsRect(this, localMouse)) {
            return 'cursor'
        }
    }

    rest() {
        if (this.trigger) {
            this.trigger.hovered = false
        }

        if (this.documents) {
            this.documents.forEach(document => {
                if (document.interaction?.grabbed) {
                    this.drop(document)
                }

                document.interaction = undefined
            })
        }
    }

    containsSurfacePoint(point: Vector): boolean {
        return this.position.x <= point.x &&
            point.x <= this.position.x + this.size.x &&
            this.position.y <= point.y &&
            point.y <= this.position.y + this.size.y
    }

    drawCore(ctx: CanvasRenderingContext2D) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 3

        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 1

        if (this.trigger && !this.trigger.onSurface) {
            ctx.fillStyle = '#bba726'
            ctx.fillRect(...rectToDetails(this.trigger))
        }
        
        ctx.fillStyle = '#ffc766'
        ctx.fillRect(0, 0, this.size.x, this.size.y)

        if (this.trigger && this.trigger.onSurface) {
            ctx.fillStyle = '#bba726'
            ctx.fillRect(...rectToDetails(this.trigger))
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.drawCore(ctx)

        if (this.documents) {
            this.documents.forEach(document => {
                // Parent is responsible for drawing grabbed documents
                if (document.interaction?.grabbed) return

                document.draw(ctx)
            })
        }
    }

    addTrigger(trigger: SurfaceI['trigger']): this {
        this.trigger = trigger

        return this
    }
}
