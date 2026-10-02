import { GameInstance } from '../core/GameInstance'
import { Vector } from '../core/Vector'

import { createDocumentImage } from './createDocument'
import GrabImg from './assets/grab.png'
import HandImg from './assets/hand.png'
import PointerImg from './assets/pointer.png'
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
import { HerbGarden } from './HerbGarden'

const DROPPED_SCALE = 0.9

const SURFACE_ANIMATION = 1000
const DRAWER_SPEED = 500
const SLIDE_TO_SURFACE = 150

const WIDTH = 480
const HEIGHT = 270

const grabImg = new Image()
grabImg.src = GrabImg.src
const handImg = new Image()
handImg.src = HandImg.src
const pointerImg = new Image()
pointerImg.src = PointerImg.src

export class HerbsGame extends GameInstance {
    innerCanvas: HTMLCanvasElement
    innerCtx: CanvasRenderingContext2D

    surfaces: Surface[]

    herbGarden: HerbGarden

    constructor(canvas: HTMLCanvasElement) {
        super(canvas)

        this.herbGarden = new HerbGarden(WIDTH * 0.8, HEIGHT)

        this.innerCanvas = document.createElement('canvas')
        this.innerCanvas.width = WIDTH
        this.innerCanvas.height = HEIGHT
        this.innerCtx = this.innerCanvas.getContext('2d')!

        this.ctx.imageSmoothingEnabled = false

        this.surfaces = [
            {
                id: createId(),
                position: new Vector(WIDTH - 60, HEIGHT - 60),
                size: new Vector(50, 50),
                inset: 0,
            },
        ]

        const numDrawers = 4
        const knobSize = 14

        for (let i = 0; i < numDrawers; i++) {
            const xInset = 10
            const left = WIDTH * i / numDrawers + xInset
            const w = WIDTH / numDrawers - 2 * xInset

            const drawerInset = 12

            this.surfaces.push({
                id: createId(),
                position: new Vector(left, HEIGHT * 0.3 - drawerInset),
                size: new Vector(w, HEIGHT * 0.3 + drawerInset),
                documents: [],
                inset: 5,
                draw: (surface) => this.drawDrawer(surface),
                trigger: {
                    position: new Vector(w / 2 - knobSize / 2, HEIGHT * 0.3 + drawerInset),
                    size: new Vector(knobSize, knobSize),
                    enabled: false,
                    parentShift: new Vector(0, HEIGHT * 0.3),
                    hovered: false,
                    onSurface: false,
                    animSpeed: DRAWER_SPEED,
                },
            })
        }

        this.surfaces.push(...[
            {
                id: createId(),
                position: new Vector(0, 0),
                size: new Vector(WIDTH, HEIGHT * 0.6),
                documents: [],
                inset: 0,
            },
            {
                id: createId(),
                position: new Vector(0, 0),
                size: new Vector(WIDTH / 2, HEIGHT / 2),
                documents: [],
                trigger: {
                    position: new Vector(0, HEIGHT / 2 - 10),
                    size: new Vector(WIDTH / 2, 10),
                    enabled: false,
                    parentShift: new Vector(WIDTH / 2, 0),
                    hovered: false,
                    onSurface: true,
                    animSpeed: SURFACE_ANIMATION,
                },
                inset: 3,
            },
            {
                id: createId(),
                position: new Vector(-WIDTH * 0.8 + 10, 0),
                size: new Vector(WIDTH * 0.8, HEIGHT),
                draw: (surface: Surface) => this.drawPlantShelf(surface),
                trigger: {
                    position: new Vector(WIDTH * 0.8, 0),
                    size: new Vector(knobSize, knobSize),
                    enabled: false,
                    parentShift: new Vector(WIDTH * 0.8 - 10, 0),
                    hovered: false,
                    onSurface: true,
                    animSpeed: SURFACE_ANIMATION,
                },
                inset: 0,
            },
        ])

        this.surfaces.forEach(surface => {
            if (!surface.documents) {
                return
            }

            const surfaceArea = surface.size.x * surface.size.y
            let totalArea = 0

            while (totalArea < surfaceArea / 5) {
                const newSize = new Vector(randInt(45, 55), randInt(60, 75))
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

    getMousePos(): Vector | undefined {
        const raw = this.mousePos?.scale(this.innerCanvas.width / this.canvas.width)
        return raw ? new Vector(
            Math.round(raw.x),
            Math.round(raw.y),
        ) : undefined
    }

    update(elapsedTime: number) {
        this.herbGarden.updateState(elapsedTime)

        const mousePos = this.getMousePos()

        this.surfaces.forEach(surface => {
            if (surface.animation) {
                surface.documents?.forEach(doc => doc.interaction = undefined)
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

            surface.documents?.forEach(document => {
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

        const special = this.surfaces.flatMap(s => s.documents ?? [])
            .findLast(doc => !!doc.interaction)


        if (special || !mousePos) {
            this.clearSurfaceTriggerHovers()
        }

        if (special?.interaction!.grabbed) {
            if (mousePos && this.mouseDown) {
                // Move it around
                special.position = mousePos?.add(special.interaction.offset)
            } else {
                special.interaction.grabbed = false

                const currentSurface = this.surfaces.find(s => s.id === special.surfaceId)!
                const absolutePosition = special.position.add(currentSurface.position)

                const nextSurface = this.surfaces.findLast(surface => overlapsRect(surface, absolutePosition))

                if (nextSurface && nextSurface.documents && nextSurface !== currentSurface) {
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
                    
                    currentSurface.documents = currentSurface.documents?.filter(d => d !== special)
                    nextSurface.documents?.push(special)
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
            const dist = mousePos?.diff(special.position.add(surface.position))

            if (mousePos && this.mouseDown && !special.interaction.grabbed) {
                // Now grab
                special.interaction.offset = special.position.diff(mousePos)
                special.interaction.grabbed = true
            } else if (!dist || !mousePos || !overlaps(dist, special.size)) {
                // Not mousing over at all
                special.interaction = undefined
            } else {
                // Otherwise overlapping
                const thingHovered = returnFirstLast(this.surfaces, (surface) => {
                    const mouseInSpace = mousePos.diff(surface.position)

                    const overlappedDocument = surface.documents?.findLast(doc => overlaps(mouseInSpace.diff(doc.position), doc.size))

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

        if (!special?.interaction?.hovered && mousePos) {
            const hoveredThing = returnFirstLast(this.surfaces, (surface) => {
                if (!surface.animation) {
                    const hoveredDoc = surface.documents?.findLast(document => {
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

                if (surface.trigger) {
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
                        mousePos,
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

                const docIndex = s.documents!.findLastIndex(d => d === hoveredThing)
                s.documents!.splice(docIndex, 1)
                s.documents!.push(hoveredThing)
                hoveredThing.interaction = {
                    hovered: true,
                    grabbed: this.mouseDown,
                    offset: hoveredThing.position.diff(mousePos).diff(s.position),
                }
            } else {
                this.clearSurfaceTriggerHovers()
            }
        }
    }

    drawDrawer(surface: Surface) {
        const ctx = this.innerCtx

        ctx.fillStyle = '#883300'

        if (surface.trigger) {
            ctx.fillRect(...rectToDetails(surface.trigger))
        }

        ctx.fillRect(0, 0, surface.size.x, surface.size.y)

        ctx.beginPath()
        ctx.rect(0, 0, surface.inset, surface.size.y)
        ctx.rect(surface.size.x - surface.inset, 0, surface.inset, surface.size.y)
        ctx.rect(0, surface.size.y - surface.inset, surface.size.x, surface.inset)
        ctx.fill()
    }

    drawPlantShelf(surface: Surface) {
        const ctx = this.innerCtx

        ctx.fillStyle = '#883300'
        if (surface.trigger) {
            ctx.fillRect(...rectToDetails(surface.trigger))
        }

        ctx.fillRect(0, 0, surface.size.x, surface.size.y)

        if (!surface.animation && !surface.trigger?.enabled) {
            // Avoid rendering contents if closed
        } else {
            ctx.shadowColor = ''
            ctx.shadowBlur = 0
    
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0

            this.herbGarden.draw(ctx)
    
            // ctx.beginPath()
            // ctx.fillStyle = 'yellow'
            // ctx.ellipse(100, 100, 20, 20, 0, 0, 2 * Math.PI)
            // ctx.fill()
        }
    }

    draw() {
        let anyGrabbed = false
        let anyHovered = false

        const ctx = this.innerCtx
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, WIDTH, HEIGHT)

        const drawDocument = (document: Document, surface?: Surface) => {
            const scale = document.interaction?.hovered ? 1 : DROPPED_SCALE
    
            const { x: w, y: h } = document.size.scale(scale)

            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
            ctx.shadowBlur = document.interaction
                ? document.interaction.grabbed
                    ? 10
                    : 5
                : 2

            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = document.interaction
                ? document.interaction.grabbed
                    ? 5
                    : 2
                : 1

            ctx.drawImage(
                document.shape,
                Math.round((surface?.position?.x ?? 0) + document.position.x - w / 2),
                Math.round((surface?.position?.y ?? 0) + document.position.y - h / 2),
                w,
                h,
            )
        }

        this.surfaces.forEach(surface => {
            ctx.save()

            ctx.translate(surface.position.x, surface.position.y)

            if (surface.trigger?.hovered) {
                anyHovered = true
            }

            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
            ctx.shadowBlur = 3

            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 1

            if (surface.draw) {
                surface.draw(surface)
            } else {
                const drawTrigger = (trigger: Required<Surface>['trigger']) => {
                    ctx.fillStyle = '#bba726'
    
                    ctx.fillRect(...rectToDetails({
                        position: trigger.position,
                        size: trigger.size,
                    }))
                }
    
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
                ctx.shadowBlur = 3
    
                ctx.shadowOffsetX = 0
                ctx.shadowOffsetY = 1
    
                if (surface.trigger && !surface.trigger.onSurface) {
                    drawTrigger(surface.trigger)
                }
    
                ctx.fillStyle = '#ffc766'
                ctx.fillRect(0, 0, surface.size.x, surface.size.y)
    
                if (surface.trigger && surface.trigger.onSurface) {
                    ctx.shadowColor = ''
                    ctx.shadowBlur = 0
                    ctx.shadowOffsetX = 0
                    ctx.shadowOffsetY = 0
    
                    drawTrigger(surface.trigger)
                }
            }

    
            surface.documents?.forEach(document => {
                if (document.interaction?.grabbed) {
                    anyGrabbed = true
                } else if (document.interaction?.hovered) {
                    anyHovered = true
                }

                if (document.surfaceId !== surface.id || document.interaction?.grabbed) {
                    return
                }

                drawDocument(document)
            })

            ctx.restore()
        })

        this.surfaces.forEach(surface => {
            surface.documents?.filter(d => d.interaction?.grabbed).forEach(document => {
                drawDocument(document, surface)
            })
        })

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = anyGrabbed
            ? 1
            : anyHovered ? 4 : 7

        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = anyGrabbed
            ? 1
            : anyHovered ? 2 : 4

        const mousePos = this.getMousePos()
        if (mousePos) {
            if (anyGrabbed) {
                ctx.drawImage(grabImg, mousePos.x - 10, mousePos.y - 5)
            } else if (anyHovered) {
                ctx.drawImage(handImg, mousePos.x - 9, mousePos.y - 6)
            } else {
                ctx.drawImage(pointerImg, mousePos.x, mousePos.y)
            }
        }

        this.ctx.drawImage(this.innerCanvas, 0, 0, this.canvas.width, this.canvas.height)
    }
}
