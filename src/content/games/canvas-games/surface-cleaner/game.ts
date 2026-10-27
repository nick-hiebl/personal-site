import { GameInstance } from '../core/GameInstance'
import { Vector } from '../core/Vector'

import { Player } from './entities/Player'
import { BUNDLE_SIZE, CELL_SIZE, FULL_WORLD_HEIGHT, FULL_WORLD_WIDTH } from './world/constants'
import { WorldGrid } from './world/WorldGrid'

const WIDTH = 1440
const HEIGHT = 810

const EDGE_BUFFER = 40

export class SurfaceCleanerGame extends GameInstance {
    innerCanvas: HTMLCanvasElement
    innerCtx: CanvasRenderingContext2D

    worldGrid: WorldGrid

    camera: Vector

    players: Player[]

    clearedCells: number

    constructor(canvas: HTMLCanvasElement) {
        super(canvas)

        this.innerCanvas = document.createElement('canvas')
        this.innerCanvas.width = WIDTH + 2 * EDGE_BUFFER
        this.innerCanvas.height = HEIGHT + 2 * EDGE_BUFFER
        this.innerCtx = this.innerCanvas.getContext('2d')!

        this.ctx.imageSmoothingEnabled = false

        this.camera = new Vector(0, 0)

        this.worldGrid = new WorldGrid(FULL_WORLD_WIDTH / 2, FULL_WORLD_HEIGHT / 2)
        
        this.players = [
            new Player(new Vector((FULL_WORLD_WIDTH + BUNDLE_SIZE * CELL_SIZE) / 2, (FULL_WORLD_HEIGHT + BUNDLE_SIZE * CELL_SIZE) / 2)),
        ]

        this.clearedCells = 0
    }

    update(elapsedTime: number) {
        if (this.players[0]) {
            this.camera = this.players[0].position
        }

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
    }

    draw() {
        this.innerCtx.fillStyle = 'black'
        this.innerCtx.fillRect(0, 0, this.innerCanvas.width, this.innerCanvas.height)

        const cameraTopLeft = this.camera.add(new Vector(-WIDTH / 2, -HEIGHT / 2))

        {
            const innerLeft = Math.floor(cameraTopLeft.x - EDGE_BUFFER)
            const innerTop = Math.floor(cameraTopLeft.y - EDGE_BUFFER)
            this.worldGrid.drawWorldGrid(
                this.innerCtx,
                new Vector(innerLeft, innerTop),
                new Vector(innerLeft + WIDTH + 2 * EDGE_BUFFER, innerTop + HEIGHT + 2 * EDGE_BUFFER),
            )

            this.ctx.drawImage(this.innerCanvas, innerLeft - cameraTopLeft.x, innerTop - cameraTopLeft.y, WIDTH + 2 * EDGE_BUFFER, HEIGHT + 2 * EDGE_BUFFER)
        }

        this.players.forEach(player => {
            this.ctx.fillStyle = 'blue'
            this.ctx.fillRect(player.position.x - 5 - cameraTopLeft.x, player.position.y - 5 - cameraTopLeft.y, 10, 10)
        })

        // this.ctx.fillStyle = 'green'
        // this.ctx.font = '24px sans-serif'
        // this.ctx.fillText(`${this.clearedCells}`, 10, HEIGHT - 8)

        const mainPlayer = this.players[0]

        if (mainPlayer) {
            this.ctx.strokeStyle = 'green'
            this.ctx.lineWidth = 4
            this.ctx.strokeRect(16, HEIGHT - 16 - 100 - 12, 32, 100 + 12)
            const capacity = Math.min(1, mainPlayer.store / mainPlayer.storeCap) * 100

            this.ctx.fillStyle = 'green'
            this.ctx.fillRect(22, HEIGHT - 16 - 6, 20, -capacity)
        }
    }
}
