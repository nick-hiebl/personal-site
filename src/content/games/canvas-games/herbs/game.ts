import { GameInstance } from '../core/GameInstance'
import { Vector } from '../core/Vector'

import ImgGrab from './assets/grab.png'
import ImgHand from './assets/hand.png'
import ImgPoint from './assets/point.png'
import ImgCursor from './assets/pointer.png'
import type { CursorMode, SurfaceI } from './types'
import {
    clampToSurface,
    randInt,
    rectToDetails,
    returnFirstLast,
} from './utils'
import { HerbGarden } from './HerbGarden'
import { Surface } from './Surface'
import { Document } from './Document'
import { DRAWER_SPEED, HEIGHT, SURFACE_ANIMATION, WIDTH } from './constants'
import { DrawerSurface } from './surfaces/DrawerSurface'
import { HerbGardenSurface } from './surfaces/HerbGardenSurface'

const grabImg = new Image()
grabImg.src = ImgGrab.src
const handImg = new Image()
handImg.src = ImgHand.src
const pointImg = new Image()
pointImg.src = ImgPoint.src
const cursorImg = new Image()
cursorImg.src = ImgCursor.src

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
            // new Surface(
            //     'floating-noninteractive',
            //     new Vector(WIDTH - 60, HEIGHT - 60),
            //     new Vector(50, 50),
            //     { noDrop: true },
            // ),
        ]

        const numDrawers = 4
        const knobSize = 14

        for (let i = 0; i < numDrawers; i++) {
            const xInset = 10
            const left = WIDTH * i / numDrawers + xInset
            const w = WIDTH / numDrawers - 2 * xInset

            const drawerInset = 12

            this.surfaces.push(
                new DrawerSurface(
                    `drawer-${i}`,
                    new Vector(left, HEIGHT * 0.3 - drawerInset),
                    new Vector(w, HEIGHT * 0.3 + drawerInset),
                    { inset: 5 },
                )
                    .addTrigger({
                        position: new Vector(w / 2 - knobSize / 2, HEIGHT * 0.3 + drawerInset),
                        size: new Vector(knobSize, knobSize),
                        enabled: false,
                        parentShift: new Vector(0, HEIGHT * 0.3),
                        hovered: false,
                        onSurface: false,
                        animSpeed: DRAWER_SPEED,
                    }),
            )
        }

        this.surfaces.push(...[
            new Surface(
                'table',
                new Vector(0, 0),
                new Vector(WIDTH, HEIGHT * 0.6),
                { inset: -5 }
            ),
            new Surface(
                'railing',
                new Vector(0, 0),
                new Vector(WIDTH / 2, HEIGHT / 2),
                { inset: 3 },
            )
                .addTrigger({
                    position: new Vector(0, HEIGHT / 2 - 10),
                    size: new Vector(WIDTH / 2, 10),
                    enabled: false,
                    parentShift: new Vector(WIDTH / 2, 0),
                    hovered: false,
                    onSurface: true,
                    animSpeed: SURFACE_ANIMATION,
                }),
            // { vvv
            //     draw: (surface: SurfaceI) => this.drawPlantShelf(surface),
            // },
            new HerbGardenSurface(
                'plant-shelf',
                new Vector(-WIDTH * 0.8 + 10, 0),
                new Vector(WIDTH * 0.8, HEIGHT),
                { noDrop: true, herbGarden: this.herbGarden },
            )
                .addTrigger({
                    position: new Vector(WIDTH * 0.8, 0),
                    size: new Vector(knobSize, knobSize),
                    enabled: false,
                    parentShift: new Vector(WIDTH * 0.8 - 10, 0),
                    hovered: false,
                    onSurface: false,
                    animSpeed: SURFACE_ANIMATION,
                }),
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

                const newDoc = new Document(
                    clampToSurface(surface, abs, newSize),
                    newSize,
                    surface,
                )
    
                surface.documents.push(newDoc)
                break
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
            surface.update(elapsedTime)
        })

        const onDrop = (document: Document) => {
            const relevantSurface = this.surfaces.findLast((surface) =>
                surface.documents &&
                surface.containsSurfacePoint(document.position.add(document.surface.position))
            ) ?? document.surface

            if (relevantSurface instanceof Surface) {
                relevantSurface.drop(document)
            } else {
                console.warn('Dropping on non-Surface surface')
            }
        }

        if (mousePos) {
            const grabbingSurface = this.surfaces.findLast(
                (surface) => surface?.documents
                    ?.findLast(doc => doc.interaction?.grabbed)
            )

            const isGrabActing = grabbingSurface?.isActing(mousePos, this.mouseDown, onDrop)
            const grabSurfaceActive =isGrabActing ? grabbingSurface : undefined

            const actingSurface = this.surfaces.reduceRight<Surface | undefined>((actingSurface, surface) => {
                if (actingSurface && actingSurface !== surface) {
                    surface.rest()
                    return actingSurface
                }

                const isActing = surface.isActing(mousePos, this.mouseDown, onDrop)

                if (isActing) {
                    return surface
                }
            }, grabSurfaceActive)
        } else {
            this.surfaces.forEach((surface) => {
                surface.rest()
            })
        }
    }

    draw() {
        const ctx = this.innerCtx
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, WIDTH, HEIGHT)

        this.surfaces.forEach(surface => {
            ctx.save()

            ctx.translate(surface.position.x, surface.position.y)

            surface.draw(ctx)

            ctx.restore()
        })

        this.surfaces.forEach(surface => {
            surface.documents?.filter(d => d.interaction?.grabbed).forEach(document => {
                ctx.save()
                ctx.translate(surface.position.x, surface.position.y)
                document.draw(ctx)
                ctx.restore()
            })
        })

        const mousePos = this.getMousePos()
        if (mousePos) {
            const cursorType = returnFirstLast(this.surfaces, (surface) => {
                return surface.cursorMode(mousePos, ctx)
            })

            if (cursorType !== 'done') {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
                const BLUR_SIZE: Record<CursorMode, number> = {
                    cursor: 7,
                    point: 4,
                    'can-grab': 4,
                    grabbing: 1,
                }
                ctx.shadowBlur = cursorType ? BLUR_SIZE[cursorType] : 7
    
                ctx.shadowOffsetX = 0
                const OFFSET_Y: Record<CursorMode, number> = {
                    cursor: 4,
                    point: 2,
                    'can-grab': 2,
                    grabbing: 1,
                }
                ctx.shadowOffsetY = cursorType ? OFFSET_Y[cursorType] : 4
    
                if (cursorType === 'grabbing') {
                    ctx.drawImage(grabImg, mousePos.x - 10, mousePos.y - 5)
                } else if (cursorType === 'can-grab') {
                    ctx.drawImage(handImg, mousePos.x - 9, mousePos.y - 6)
                } else if (cursorType === 'point') {
                    ctx.drawImage(pointImg, mousePos.x - 5, mousePos.y - 2)
                } else if (cursorType === 'cursor' || !cursorType) {
                    ctx.drawImage(cursorImg, mousePos.x, mousePos.y)
                }
            }

        }

        this.ctx.drawImage(this.innerCanvas, 0, 0, this.canvas.width, this.canvas.height)
    }
}
