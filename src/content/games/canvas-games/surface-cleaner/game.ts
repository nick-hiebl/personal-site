import { GameInstance } from '../core/GameInstance'
import { inputBuffer, type InputBuffer } from '../core/input-buffer'
import { randInt } from '../core/random'
import { Vector } from '../core/Vector'

import { BuildMenu } from './BuildMenu'
import { Player } from './entities/Player'
import { Robot } from './entities/Robot'
import { Seller } from './entities/Seller'
import { Silo } from './entities/Silo'
import { RobotSettings } from './settings/RobotSettings'
import { SiloSettings } from './settings/SiloSettings'
import { StoreSettings } from './settings/StoreSettings'
import { SurfaceCleanerStore } from './Store'
import { drawFrame } from './world/Bundle'
import {
    BUNDLE_SCALE,
    BUNDLE_SIZE,
    CELL_SIZE,
    FULL_WORLD_HEIGHT,
    FULL_WORLD_WIDTH,
    WORLD_HEIGHT,
    WORLD_WIDTH,
} from './world/constants'
import { WorldGrid } from './world/WorldGrid'

const WIDTH = 1440
const HEIGHT = 810

const EDGE_BUFFER = 40

// 1 cell per millisecond
const SELL_RATE = 3

const CAMERA_OFFSET = new Vector(-WIDTH / 2, -HEIGHT / 2)

const createTempCtx = (width: number, height: number): {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
} => {
    const canvas: HTMLCanvasElement = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')!

    return { canvas, ctx }
}

export class SurfaceCleanerGame extends GameInstance {
    innerCanvas: HTMLCanvasElement
    innerCtx: CanvasRenderingContext2D

    mapCanvas: HTMLCanvasElement
    mapCtx: CanvasRenderingContext2D

    mapHotCanvas: HTMLCanvasElement
    mapHotCtx: CanvasRenderingContext2D

    tempCanvas: HTMLCanvasElement
    tempCtx: CanvasRenderingContext2D

    gameTime: number = 0

    worldGrid: WorldGrid

    camera: Vector

    players: Player[]
    stores: Seller[]
    robots: Robot[]
    silos: Silo[]

    entityMap: Map<number, Silo | Robot | Seller>

    sellRate: number
    conversionRate: number

    clearedCells: number
    lastMoney: number
    money: number

    store: SurfaceCleanerStore
    buildMenu: BuildMenu

    isMapOpen: boolean = false
    zoomLevel: number = 0.9

    buildMenuInput: InputBuffer
    escapeInput: InputBuffer
    mapInput: InputBuffer

    constructor(canvas: HTMLCanvasElement) {
        super(canvas)

        const { canvas: innerCanvas, ctx: innerCtx } = createTempCtx(WIDTH + 2 * EDGE_BUFFER, HEIGHT + 2 * EDGE_BUFFER)
        this.innerCanvas = innerCanvas, this.innerCtx = innerCtx

        const { canvas: mapCanvas, ctx: mapCtx } = createTempCtx(WORLD_WIDTH, WORLD_HEIGHT)
        this.mapCanvas = mapCanvas, this.mapCtx = mapCtx

        const { canvas: mapHotCanvas, ctx: mapHotCtx } = createTempCtx(WORLD_WIDTH, WORLD_HEIGHT)
        this.mapHotCanvas = mapHotCanvas, this.mapHotCtx = mapHotCtx

        const { canvas: tempCanvas, ctx: tempCtx } = createTempCtx(WORLD_WIDTH, WORLD_HEIGHT)
        this.tempCanvas = tempCanvas, this.tempCtx = tempCtx

        this.ctx.imageSmoothingEnabled = false

        this.camera = new Vector(0, 0)

        this.worldGrid = new WorldGrid([
            {
                excluded: new Vector(400, 300),
                topLeft: new Vector(401, 300),
                bottomRight: new Vector(402, 301),
                color: 'pink',
            },
            {
                topLeft: new Vector(399, 299),
                bottomRight: new Vector(402, 302),
                color: 'brown',
            },
            {
                topLeft: new Vector(398, 298),
                bottomRight: new Vector(403, 303),
                excluded: new Vector(400, 300),
                color: '#449fd1',
            },
            {
                topLeft: new Vector(360, 260),
                bottomRight: new Vector(440, 340),
                excluded: new Vector(400, 300),
                color: '#044984',
            },
            {
                topLeft: new Vector(300, 200),
                bottomRight: new Vector(500, 400),
                excluded: new Vector(400, 300),
                color: '#b4d2dc',
            },
            {
                topLeft: new Vector(0, 0),
                bottomRight: new Vector(800, 600),
                excluded: new Vector(400, 300),
                color: '#ecc685',
            },
        ])

        const origin = new Vector((FULL_WORLD_WIDTH + BUNDLE_SIZE * CELL_SIZE) / 2, (FULL_WORLD_HEIGHT + BUNDLE_SIZE * CELL_SIZE) / 2)

        this.players = [
            new Player(origin),
        ]

        this.stores = [
            new Seller(origin),
        ]

        this.robots = []
        this.silos = []

        this.entityMap = new Map()

        this.sellRate = SELL_RATE
        this.conversionRate = 1

        this.clearedCells = 0
        this.lastMoney = 0
        this.money = 0

        this.store = new SurfaceCleanerStore()
        this.buildMenu = new BuildMenu()

        this.buildMenuInput = inputBuffer(() => this.onBuildPressed())
        this.escapeInput = inputBuffer(() => this.onEscPressed())
        this.mapInput = inputBuffer(() => this.onMapPressed())
    }

    onBuildPressed() {
        if (this.isMapOpen) {
            return
        }

        this.buildMenu.setOpen((c) => !c)
    }

    onEscPressed() {
        this.isMapOpen = false
        this.buildMenu.setOpen(false)
    }

    onMapPressed() {
        this.isMapOpen = !this.isMapOpen

        if (this.isMapOpen) {
            this.buildMenu.setOpen(false)
        }
    }

    getMouseTargetPos(mousePos = this.mousePos): Vector | undefined {
        if (!mousePos || isNaN(mousePos.x) || isNaN(mousePos.y)) {
            return
        }

        return this.camera.add(mousePos).add(CAMERA_OFFSET)
    }

    onClick(mousePos: Vector) {
        const targetPos = this.getMouseTargetPos(mousePos)

        if (!targetPos) {
            return
        }

        if (!this.buildMenu.state.open || !this.buildMenu.state.selected) {
            return
        }

        const { worldPos } = this.worldGrid.getBundleAndCell(targetPos)

        switch (this.buildMenu.state.selected) {
            // Robot can be placed even in conflicting space
            case 'robot':
                break;
            default:
                if (!this.worldGrid.canPlaceAt(targetPos)) {
                    return
                }
        }

        switch (this.buildMenu.state.selected) {
            case 'robot':
                if (this.money >= RobotSettings.cost) {
                    this.money -= RobotSettings.cost
                    const robot = new Robot(worldPos)
                    this.entityMap.set(robot.id, robot)
                    this.robots.push(robot)
                }
                break
            case 'silo':
                if (this.money >= SiloSettings.cost) {
                    this.money -= SiloSettings.cost
                    const silo = new Silo(worldPos)
                    this.entityMap.set(silo.id, silo)
                    this.worldGrid.placeStructureAt(targetPos, silo.id)
                    this.silos.push(silo)
                }
                break
            case 'store':
                if (this.money >= StoreSettings.cost) {
                    this.money -= StoreSettings.cost
                    const store = new Seller(worldPos)
                    this.entityMap.set(store.id, store)
                    this.worldGrid.placeStructureAt(targetPos, store.id)
                    this.stores.push(store)
                }
                break
        }
    }

    update(rawElapsedTime: number) {
        // Capping elapsedTime to 10fps, to prevent crazy stutter behavior during lag spikes or browser inactivity
        const elapsedTime = Math.min(rawElapsedTime, 100)

        this.gameTime += elapsedTime

        this.buildMenuInput(this.keys.get('KeyB') ?? false)
        this.escapeInput(this.keys.get('Escape') ?? false)
        this.mapInput(this.keys.get('KeyM') ?? false)

        if (this.isMapOpen) {
            const zoomStep = +(this.keys.get('BracketRight') ?? false) - +(this.keys.get('BracketLeft') ?? false)

            this.zoomLevel = Math.max(0, Math.min(this.zoomLevel + zoomStep * elapsedTime / 1000, 1))
        }

        if (this.worldGrid.remainingBundles <= 0) {
            const newLeveled = this.worldGrid.goToNextLayer()

            if (newLeveled) {
                this.robots.forEach((robot) => {
                    robot.resetState()
                })
            }
        }

        if (this.players[0]) {
            this.camera = this.players[0].position
        }

        // Randomising robot processing order so each robot has a chance at claiming the first free silo availability
        const firstRobotIndex = randInt(0, this.robots.length)
        const robotsList = this.robots.slice(firstRobotIndex).concat(this.robots.slice(0, firstRobotIndex))
        robotsList.forEach((robot) => {
            robot.update(elapsedTime, this)

            if (robot.store < RobotSettings.storeCap) {
                const clearedCells = this.worldGrid.clearCells(...robot.getBoundingBox())
                robot.store += clearedCells

                this.clearedCells += clearedCells
            }
        })

        this.robots = this.robots.filter((robot) => !robot.dead)

        this.players.forEach((player, playerIndex) => {
            const directionalInput = playerIndex === 0
                ? new Vector(
                    (this.keys.get('KeyD') ? 1 : 0) + (this.keys.get('KeyA') ? -1 : 0),
                    (this.keys.get('KeyS') ? 1 : 0) + (this.keys.get('KeyW') ? -1 : 0),
                )
                : new Vector(0, 0)
            player.update(elapsedTime, directionalInput)

            if (player.store < player.storeCap) {
                const clearedCells = this.worldGrid.clearCells(...player.getBoundingBox())
                player.store += clearedCells

                this.clearedCells += clearedCells
            }
        })

        this.stores.forEach((entity) => {
            entity.update(elapsedTime, this)
        })

        this.silos.forEach((entity) => {
            entity.update(elapsedTime, this)
        })

        const someShopActive = this.stores.some((entity) => entity instanceof Seller && entity.active)

        if (this.money !== this.lastMoney) {
            this.store.onUpdateMoney(this.money)
            this.buildMenu.onUpdateMoney(this.money)
        }
        this.lastMoney = this.money

        this.store.setOpen(someShopActive)
    }

    drawMap() {
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT)

        if (this.worldGrid.mapDirty) {
            this.worldGrid.drawMap(this.mapCtx, this.mapHotCtx)
        }

        const zoom = Math.exp(this.zoomLevel * 3)

        const mapOffset = this.players[0].position
            .scale(-zoom / BUNDLE_SCALE)

        const mapShift = mapOffset.diff(CAMERA_OFFSET)

        this.ctx.drawImage(
            this.mapCanvas,
            0,
            0,
            WORLD_WIDTH,
            WORLD_HEIGHT,
            mapShift.x,
            mapShift.y,
            WORLD_WIDTH * zoom,
            WORLD_HEIGHT * zoom,
        )
        this.tempCtx.globalCompositeOperation = 'destination-over'
        this.tempCtx.globalAlpha = 1
        this.tempCtx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
        this.tempCtx.drawImage(this.mapHotCanvas, 0, 0)
        this.tempCtx.globalCompositeOperation = 'source-in'
        this.tempCtx.globalAlpha = Math.sin(this.gameTime / 300) / 8 + 2 / 3
        this.tempCtx.fillStyle = 'white'
        this.tempCtx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
        this.ctx.drawImage(
            this.tempCanvas,
            0,
            0,
            WORLD_WIDTH,
            WORLD_HEIGHT,
            mapShift.x,
            mapShift.y,
            WORLD_WIDTH * zoom,
            WORLD_HEIGHT * zoom,
        )

        const drawAtPositions = (positions: { position: Vector }[], radius: number) => {
            this.ctx.beginPath()
            positions.forEach(({ position }) => {
                const mapPos = position.scale(zoom / BUNDLE_SCALE).add(mapShift)
                this.ctx.moveTo(mapPos.x, mapPos.y)
                this.ctx.ellipse(mapPos.x, mapPos.y, radius, radius, 0, 0, 2 * Math.PI)
            })
            this.ctx.fill()
        }

        this.ctx.fillStyle = 'purple'
        drawAtPositions(this.silos, 4)

        this.ctx.fillStyle = 'green'
        drawAtPositions(this.robots, 4)

        this.ctx.fillStyle = 'red'
        drawAtPositions(this.stores, 5)

        this.ctx.fillStyle = '#0088ff'
        drawAtPositions(this.players, 5)
    }

    draw() {
        if (this.isMapOpen) {
            this.drawMap()
            return
        }

        this.ctx.fillStyle = this.worldGrid.nextLayerColor()
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.innerCtx.clearRect(0, 0, this.innerCanvas.width, this.innerCanvas.height)

        const cameraTopLeft = this.camera.add(CAMERA_OFFSET)

        {
            const innerLeft = Math.floor(cameraTopLeft.x - EDGE_BUFFER)
            const innerTop = Math.floor(cameraTopLeft.y - EDGE_BUFFER)
            this.worldGrid.drawWorldGrid(
                this.innerCtx,
                new Vector(innerLeft, innerTop),
                new Vector(innerLeft + WIDTH + 2 * EDGE_BUFFER, innerTop + HEIGHT + 2 * EDGE_BUFFER),
            )

            this.innerCtx.globalCompositeOperation = 'source-in'
            this.innerCtx.fillStyle = this.worldGrid.currentLayerColor()
            this.innerCtx.fillRect(0, 0, this.innerCanvas.width, this.innerCanvas.height)
            this.innerCtx.globalCompositeOperation = 'source-over'
            this.ctx.drawImage(this.innerCanvas, innerLeft - cameraTopLeft.x, innerTop - cameraTopLeft.y, WIDTH + 2 * EDGE_BUFFER, HEIGHT + 2 * EDGE_BUFFER)
        }

        for (let x = Math.floor(cameraTopLeft.x / BUNDLE_SCALE); x <= Math.ceil((cameraTopLeft.x + this.canvas.width) / BUNDLE_SCALE); x++) {
            for (let y = Math.floor(cameraTopLeft.y / BUNDLE_SCALE); y <= Math.ceil((cameraTopLeft.y + this.canvas.height) / BUNDLE_SCALE); y++) {
                drawFrame(this.ctx, cameraTopLeft, x, y, this.worldGrid.isCompleteXY(x, y))
            }
        }

        this.silos.forEach((silo) => {
            silo.draw(this.ctx, cameraTopLeft)
        })

        this.stores.forEach((entity) => {
            entity.draw(this.ctx, cameraTopLeft)
        })

        this.robots.forEach((robot) => {
            robot.draw(this.ctx, cameraTopLeft)
        })

        this.players.forEach((player) => {
            this.ctx.fillStyle = '#0088ff'
            this.ctx.fillRect(player.position.x - 5 - cameraTopLeft.x, player.position.y - 5 - cameraTopLeft.y, 10, 10)
        })

        const mainPlayer = this.players[0]

        if (mainPlayer) {
            const closestStore = this.stores.reduce((closest, store) => {
                const closestDist = closest.position.diff(mainPlayer.position).magnitude()
                const thisDist = store.position.diff(mainPlayer.position).magnitude()

                return thisDist < closestDist ? store : closest
            })

            if (closestStore) {
                const vectorTo = closestStore.position.diff(mainPlayer.position)

                if (vectorTo.magnitude() > 1000) {
                    const angleTo = Math.atan2(vectorTo.y, vectorTo.x)

                    this.ctx.save()
                    this.ctx.translate(mainPlayer.position.x - cameraTopLeft.x, mainPlayer.position.y - cameraTopLeft.y)
                    this.ctx.rotate(angleTo)

                    this.ctx.fillStyle = 'red'
                    this.ctx.beginPath()
                    this.ctx.moveTo(30, 0)
                    this.ctx.lineTo(20, 10)
                    this.ctx.lineTo(20, -10)
                    this.ctx.lineTo(30, 0)
                    this.ctx.fill()

                    this.ctx.restore()
                }
            }
        }

        if (mainPlayer) {
            this.ctx.strokeStyle = 'green'
            this.ctx.lineWidth = 4
            this.ctx.strokeRect(16, HEIGHT - 16 - 100 - 12, 32, 100 + 12)
            const capacity = Math.min(1, mainPlayer.store / mainPlayer.storeCap) * 100

            this.ctx.fillStyle = 'green'
            this.ctx.fillRect(22, HEIGHT - 16 - 6, 20, -capacity)
        }

        this.ctx.fillStyle = `#00000066`
        this.ctx.fillRect(6, 6, 230, 40)

        this.ctx.fillStyle = 'green'
        this.ctx.font = '24px sans-serif'
        this.ctx.fillText(`$${this.money.toFixed(2)}`, 16, 34)

        if (mainPlayer) {
            const x = Math.floor(mainPlayer.position.x / BUNDLE_SCALE)
            const y = Math.floor(mainPlayer.position.y / BUNDLE_SCALE)

            const cX = WORLD_WIDTH / 2
            const cY = WORLD_HEIGHT / 2

            const latitude = y <= cY ? `N${cY - y}` : `S${y - cY}`
            const longitude = x < cX ? `W${cX - x}` : `E${x - cX}`

            this.ctx.fillText(`${latitude}, ${longitude}`, 120, 34)
        }

        const targetPos = this.getMouseTargetPos(this.mousePos)
        if (targetPos && this.buildMenu.state.open && this.buildMenu.state.selected) {
            const COSTS = {
                robot: RobotSettings.cost,
                silo: SiloSettings.cost,
                store: StoreSettings.cost,
            }
            const cost = COSTS[this.buildMenu.state.selected]
            const canAfford = this.money >= cost

            const { worldPos } = this.worldGrid.getBundleAndCell(targetPos)
            const drawPos = worldPos.diff(cameraTopLeft)

            const hasRoom = this.worldGrid.canPlaceAt(targetPos)

            this.ctx.fillStyle = canAfford && hasRoom ? 'blue' : 'red'
            this.ctx.beginPath()
            this.ctx.ellipse(
                drawPos.x,
                drawPos.y,
                3,
                3,
                0,
                0,
                2 * Math.PI,
            )
            this.ctx.fill()
        }
    }
}
