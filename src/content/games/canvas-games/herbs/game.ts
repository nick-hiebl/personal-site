import { GameInstance } from '../core/GameInstance'
import { Vector } from '../core/Vector'

import { createDocumentImage } from './createDocument'
import type { Document, Rect, Surface } from './types'
import {
    clampToSurface,
    createId,
    fastStep,
    isSurface,
    lerpVector,
    overlaps,
    overlapsRect,
    randInt,
    rectToDetails,
    returnFirstLast,
    smoothStep,
} from './utils'

const DROPPED_SCALE = 0.9

const SURFACE_ANIMATION = 1000
const SLIDE_TO_SURFACE = 150

export class HerbsGame extends GameInstance {
    surfaces: Surface[]

    constructor(canvas: HTMLCanvasElement) {
        super(canvas)

        this.surfaces = []

        const numDrawers = 4

        for (let i = 0; i < numDrawers; i++) {
            const xInset = 30
            const left = canvas.width * i / numDrawers + xInset
            const w = canvas.width / numDrawers - 2 * xInset

            this.surfaces.push({
                id: createId(),
                position: new Vector(left, canvas.height * 0.3 - 25),
                size: new Vector(w, canvas.height * 0.3 + 25),
                documents: [],
                inset: 10,
                trigger: {
                    position: new Vector(w / 2 - 15, canvas.height * 0.3 + 25),
                    size: new Vector(30, 30),
                    enabled: false,
                    parentShift: new Vector(0, canvas.height * 0.3),
                    hovered: false,
                    onSurface: false,
                },
            })
        }

        this.surfaces.push(...[
            {
                id: createId(),
                position: new Vector(0, 0),
                size: new Vector(canvas.width, canvas.height * 0.6),
                documents: [],
                inset: 0,
            },
            {
                id: createId(),
                position: new Vector(0, 0),
                size: new Vector(canvas.width / 2, canvas.height / 2),
                documents: [],
                trigger: {
                    position: new Vector(0, canvas.height / 2 - 40),
                    size: new Vector(40, 40),
                    enabled: false,
                    parentShift: new Vector(canvas.width / 2, 0),
                    hovered: false,
                    onSurface: true,
                },
                inset: 3,
            },
        ])

        this.surfaces.forEach(surface => {
            const surfaceArea = surface.size.x * surface.size.y
            let totalArea = 0

            while (totalArea < surfaceArea / 5) {
                const newSize = new Vector(randInt(20, 100), randInt(20, 100))
                const newArea = newSize.x * newSize.y
                totalArea += newArea
                const startPos = new Vector(
                    randInt(0, surface.size.x),
                    randInt(0, surface.size.y),
                )
                const abs = startPos.add(surface.position)

                const newDoc: Document = {
                    position: clampToSurface(surface, abs, newSize),
                    size: newSize,
                    shape: createDocumentImage(newSize.x, newSize.y),
                    surfaceId: surface.id,
                }
    
                surface.documents.push(newDoc)
            }
        })
    }

    clearSurfaceTriggerHovers() {
        this.surfaces.forEach(surface => {
            if (surface.trigger) {
                surface.trigger.hovered = false
            }
        })
    }

    update(elapsedTime: number) {
        this.surfaces.forEach(surface => {
            if (surface.animation) {
                surface.documents.forEach(doc => doc.interaction = undefined)
                surface.animation.progress += elapsedTime

                if (surface.animation.progress >= surface.animation.duration) {
                    surface.position = surface.animation.endPos
                    surface.animation = undefined
                } else {
                    surface.position = lerpVector(
                        smoothStep(surface.animation.progress / surface.animation.duration),
                        surface.animation.startPos,
                        surface.animation.endPos,
                    )
                }
            }

            surface.documents.forEach(document => {
                if (document.animation) {
                    document.animation.progress += elapsedTime

                    if (document.animation.progress >= document.animation.duration) {
                        document.position = document.animation.endPos
                        document.animation = undefined
                    } else {
                        document.position = lerpVector(
                            fastStep(document.animation.progress / document.animation.duration),
                            document.animation.startPos,
                            document.animation.endPos,
                        )
                    }
                }
            })
        })

        const special = this.surfaces.flatMap(s => s.documents)
            .findLast(doc => !!doc.interaction)


        if (special) {
            this.clearSurfaceTriggerHovers()
        }

        if (special?.interaction!.grabbed) {
            if (this.mousePos && this.mouseDown) {
                // Move it around
                special.position = this.mousePos?.add(special.interaction.offset)
            } else {
                special.interaction.grabbed = false

                const currentSurface = this.surfaces.find(s => s.id === special.surfaceId)!
                const absolutePosition = special.position.add(currentSurface.position)

                const nextSurface = this.surfaces.findLast(surface => overlapsRect(surface, absolutePosition))

                if (nextSurface && nextSurface !== currentSurface) {
                    // Dropping onto new surface
                    special.surfaceId = nextSurface.id

                    const targetPosition = clampToSurface(nextSurface, absolutePosition, special.size)

                    if (targetPosition.x === absolutePosition.x && targetPosition.y === absolutePosition.y) {
                        special.position = absolutePosition.diff(nextSurface.position)
                    } else {
                        special.animation = {
                            startPos: absolutePosition.diff(nextSurface.position),
                            endPos: targetPosition,
                            duration: SLIDE_TO_SURFACE,
                            progress: 0,
                        }
                    }
                    
                    currentSurface.documents = currentSurface.documents.filter(d => d !== special)
                    nextSurface.documents.push(special)
                } else if (!nextSurface) {
                    special.animation = {
                        startPos: special.position,
                        endPos: clampToSurface(currentSurface, absolutePosition, special.size),
                        duration: SLIDE_TO_SURFACE * 2,
                        progress: 0,
                    }
                } else {
                    // May need to clamp into current surface
                    const targetPosition = clampToSurface(currentSurface, absolutePosition, special.size)

                    if (targetPosition.x === absolutePosition.x && targetPosition.y === absolutePosition.y) {
                        special.position = absolutePosition.diff(currentSurface.position)
                    } else {
                        special.animation = {
                            startPos: special.position,
                            endPos: targetPosition,
                            duration: SLIDE_TO_SURFACE,
                            progress: 0,
                        }
                    }
                }
                special.interaction = undefined
            }
        } else if (special?.interaction) {
            const surface = this.surfaces.find(s => s.id === special.surfaceId)!
            const dist = this.mousePos?.diff(special.position.add(surface.position))

            if (this.mousePos && this.mouseDown && !special.interaction.grabbed) {
                // Now grab
                special.interaction.offset = special.position.diff(this.mousePos)
                special.interaction.grabbed = true
            } else if (!dist || !this.mousePos || !overlaps(dist, special.size)) {
                // Not mousing over at all
                special.interaction = undefined
            } else {
                const mousePos = this.mousePos

                // Otherwise overlapping
                const thingHovered = returnFirstLast(this.surfaces, (surface) => {
                    const mouseInSpace = mousePos.diff(surface.position)

                    const overlappedDocument = surface.documents.findLast(doc => overlaps(mouseInSpace.diff(doc.position), doc.size))

                    if (overlappedDocument) {
                        return overlappedDocument
                    }

                    if (overlapsRect(surface, mousePos)) {
                        return surface
                    }
                })

                if (thingHovered !== special) {
                    special.interaction = undefined
                }
            }
        }

        if (!special?.interaction?.hovered && this.mousePos) {
            const mousePos = this.mousePos

            const hoveredThing = returnFirstLast(this.surfaces, (surface) => {
                if (!surface.animation) {
                    const hoveredDoc = surface.documents.findLast(document => {
                        const pos = surface.position.add(document.position)
                        const dist = mousePos.diff(pos)
                        const size = document.size.scale(DROPPED_SCALE)
    
                        return overlaps(dist, size)
                    })
    
                    if (hoveredDoc) {
                        return hoveredDoc
                    }
                }

                if (overlapsRect(surface, mousePos)) {
                    return surface
                }

                if (surface.trigger && !surface.trigger.onSurface) {
                    const absoluteRect: Rect = {
                        position: surface.trigger.position.add(surface.position),
                        size: surface.trigger.size,
                    }

                    if (overlapsRect(absoluteRect, mousePos)) {
                        return surface
                    }
                }
            })

            if (isSurface(hoveredThing)) {
                // Do nothing
                const surface = hoveredThing
                if (surface.animation) {
                    this.clearSurfaceTriggerHovers()
                } else if (surface.trigger) {
                    const hoveringNow = overlapsRect(
                        { position: surface.trigger.position.add(surface.position), size: surface.trigger.size },
                        this.mousePos,
                    )

                    if (surface.trigger.hovered) {
                        if (this.mouseDown) {
                            this.clearSurfaceTriggerHovers()

                            if (surface.trigger.enabled) {
                                surface.animation = {
                                    startPos: surface.position,
                                    endPos: surface.position.diff(surface.trigger.parentShift),
                                    duration: SURFACE_ANIMATION,
                                    progress: 0,
                                }
                            } else {
                                surface.animation = {
                                    startPos: surface.position,
                                    endPos: surface.position.add(surface.trigger.parentShift),
                                    duration: SURFACE_ANIMATION,
                                    progress: 0,
                                }
                            }
                            surface.trigger.enabled = !surface.trigger.enabled
                        } else {
                            this.clearSurfaceTriggerHovers()
                            surface.trigger.hovered = hoveringNow
                        }
                    } else if (hoveringNow && !this.mouseDown) {
                        this.clearSurfaceTriggerHovers()
                        surface.trigger.hovered = true
                    } else {
                        this.clearSurfaceTriggerHovers()
                    }
                } else {
                    this.clearSurfaceTriggerHovers()
                }
            } else if (hoveredThing && !this.mouseDown) {
                this.clearSurfaceTriggerHovers()

                const s = this.surfaces.find(s => s.id === hoveredThing.surfaceId)!

                const docIndex = s.documents.findLastIndex(d => d === hoveredThing)
                s.documents.splice(docIndex, 1)
                s.documents.push(hoveredThing)
                hoveredThing.interaction = {
                    hovered: true,
                    grabbed: this.mouseDown,
                    offset: hoveredThing.position.diff(this.mousePos).diff(s.position),
                }
            } else {
                this.clearSurfaceTriggerHovers()
            }
        }
    }

    draw() {
        let anyGrabbed = false
        let anyHovered = false

        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        const drawDocument = (surface: Surface, document: Document) => {
            const scale = document.interaction?.hovered ? 1 : DROPPED_SCALE
    
            const { x: w, y: h } = document.size.scale(scale)

            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
            this.ctx.shadowBlur = document.interaction
                ? document.interaction.grabbed
                    ? 20
                    : 10
                : 5

            this.ctx.shadowOffsetX = 0
            this.ctx.shadowOffsetY = document.interaction
                ? document.interaction.grabbed
                    ? 10
                    : 5
                : 2

            this.ctx.drawImage(
                document.shape,
                surface.position.x + document.position.x - w / 2,
                surface.position.y + document.position.y - h / 2,
                w,
                h,
            )
        }

        this.surfaces.forEach(surface => {
            const drawTrigger = (surface: Surface, trigger: Required<Surface>['trigger']) => {
                this.ctx.fillStyle = trigger.hovered ? 'white' : '#bba726'

                this.ctx.fillRect(...rectToDetails({
                    position: surface.position.add(trigger.position),
                    size: trigger.size,
                }))
            }

            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
            this.ctx.shadowBlur = 5

            this.ctx.shadowOffsetX = 0
            this.ctx.shadowOffsetY = 2

            if (surface.trigger && !surface.trigger.onSurface) {
                drawTrigger(surface, surface.trigger)
            }

            this.ctx.fillStyle = '#ffc766'
            this.ctx.fillRect(surface.position.x, surface.position.y, surface.size.x, surface.size.y)

            if (surface.trigger && surface.trigger.onSurface) {
                this.ctx.shadowColor = ''
                this.ctx.shadowBlur = 0
                this.ctx.shadowOffsetX = 0
                this.ctx.shadowOffsetY = 0

                drawTrigger(surface, surface.trigger)
            }
    
            surface.documents.forEach(document => {
                if (document.interaction?.grabbed) {
                    anyGrabbed = true
                } else if (document.interaction?.hovered) {
                    anyHovered = true
                }

                if (document.surfaceId !== surface.id || document.interaction?.grabbed) {
                    return
                }

                drawDocument(surface, document)
            })
        })

        this.surfaces.forEach(surface => {
            surface.documents.filter(d => d.interaction?.grabbed).forEach(document => {
                drawDocument(surface, document)
            })
        })

        this.ctx.fillStyle = 'white'
        this.ctx.strokeStyle = 'black'

        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        this.ctx.shadowBlur = anyGrabbed
            ? 3
            : anyHovered ? 8 : 15

        this.ctx.shadowOffsetX = 0
        this.ctx.shadowOffsetY = anyGrabbed
            ? 2
            : anyHovered ? 4 : 8

        if (this.mousePos) {
            this.ctx.save()
            this.ctx.translate(this.mousePos.x, this.mousePos.y)
            this.ctx.beginPath()

            this.ctx.moveTo(0, 0)
            this.ctx.lineTo(15, 15)
            this.ctx.lineTo(7, 15)
            this.ctx.lineTo(0, 20)
            this.ctx.lineTo(0, 0)
            
            this.ctx.stroke()
            this.ctx.fill()
            
            this.ctx.restore()
        }
    }
}
