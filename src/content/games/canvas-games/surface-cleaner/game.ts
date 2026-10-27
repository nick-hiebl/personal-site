import { GameInstance } from '../core/GameInstance'
import { Vector } from '../core/Vector'
import { Player } from './entities/Player'
import { FULL_WORLD_HEIGHT, FULL_WORLD_WIDTH, WorldGrid } from './WorldGrid'

const WIDTH = 1440
const HEIGHT = 810

export class SurfaceCleanerGame extends GameInstance {
    worldGrid: WorldGrid

    camera: Vector

    players: Player[]

    constructor(canvas: HTMLCanvasElement) {
        super(canvas)

        this.ctx.imageSmoothingEnabled = false

        this.camera = new Vector(-50, -100)

        this.worldGrid = new WorldGrid()
        
        this.players = [
            new Player(new Vector(FULL_WORLD_WIDTH / 2, FULL_WORLD_HEIGHT / 2)),
        ]
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
        })
    }

    draw() {
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT)

        const cameraTopLeft = this.camera.add(new Vector(-WIDTH / 2, -HEIGHT / 2))
        const cameraBottomRight = cameraTopLeft.add(new Vector(WIDTH, HEIGHT))

        this.worldGrid.drawWorldGrid(
            this.ctx,
            cameraTopLeft,
            cameraBottomRight,
        )

        this.players.forEach(player => {
            this.ctx.fillStyle = 'blue'
            this.ctx.fillRect(player.position.x - 5 - cameraTopLeft.x, player.position.y - 5 - cameraTopLeft.y, 10, 10)
        })
    }
}
