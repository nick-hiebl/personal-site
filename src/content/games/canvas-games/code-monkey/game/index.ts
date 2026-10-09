import { delay } from "./utils"

const WIDTH = 800
const HEIGHT = 600

const SCALE = 40

export type MoveCommand = 'left' | 'right' | 'up' | 'down'

const MOVE_DELAY = 250

export class MonkeyGame {
    x: number
    y: number
    width: number
    height: number

    canvas: HTMLCanvasElement | null
    ctx: CanvasRenderingContext2D | null

    isLooping: boolean
    lastTime: number

    constructor() {
        this.x = 0
        this.y = 0
        this.width = WIDTH / SCALE
        this.height = HEIGHT / SCALE

        this.canvas = null
        this.ctx = null

        this.isLooping = false
        this.lastTime = performance.now()
    }

    async executeCommand(command: MoveCommand): Promise<void> {
        switch (command) {
            case 'up':
                if (this.y < this.height - 1) {
                    this.y += 1
                }
                await delay(MOVE_DELAY)
                break
            case 'down':
                if (this.y > 0) {
                    this.y -= 1
                }
                await delay(MOVE_DELAY)
                break
            case 'left':
                if (this.x > 0) {
                    this.x -= 1
                }
                await delay(MOVE_DELAY)
                break
            case 'right':
                if (this.x < this.width - 1) {
                    this.x += 1
                }
                await delay(MOVE_DELAY)
                break
        }
    }

    setCanvas(canvas: HTMLCanvasElement) {
        if (canvas) {
            this.canvas = canvas
            this.ctx = canvas.getContext('2d')
        } else {
            this.canvas = null
            this.ctx = null
        }
    }

    draw() {
        if (!this.ctx) {
            return
        }

        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT)

        this.ctx.fillStyle = 'brown'
        this.ctx.fillRect(this.x * SCALE, (this.height - this.y - 1) * SCALE, SCALE, SCALE)
    }

    start() {
        this.isLooping = true
        this.lastTime = performance.now()

        this.mainTick()
    }

    mainTick() {
        const currentTime = performance.now()

        const elapsedTime = currentTime - this.lastTime
        this.lastTime = currentTime

        this.draw()

        if (this.isLooping) {
            requestAnimationFrame(() => this.mainTick())
        }
    }
}