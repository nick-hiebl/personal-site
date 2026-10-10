import { Vector } from '../../core/Vector'
import { Monkey } from './monkey'

const WIDTH = 800
const HEIGHT = 600

const SCALE = 40

export type MoveCommand = 'left' | 'right' | 'up' | 'down'

export class MonkeyGame {
    width: number
    height: number

    canvas: HTMLCanvasElement | null
    ctx: CanvasRenderingContext2D | null

    isLooping: boolean
    lastTime: number

    monkeys: Map<number, Monkey>

    constructor() {
        this.width = WIDTH / SCALE
        this.height = HEIGHT / SCALE

        this.canvas = null
        this.ctx = null

        this.isLooping = false
        this.lastTime = performance.now()

        this.monkeys = new Map()
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

        const ctx = this.ctx

        ctx.fillStyle = 'skyblue'
        ctx.fillRect(0, 0, WIDTH, HEIGHT)

        this.monkeys.values().forEach(monkey => {
            monkey.draw(ctx, SCALE)
        })

        ctx.fillStyle = 'green'
        ctx.beginPath()
        ctx.moveTo(0, HEIGHT)
        const LOW_GRASS = HEIGHT - 5
        const HIGH_GRASS = HEIGHT - 10
        for (let x = 0; x < WIDTH + 10; x += 8) {
            ctx.lineTo(x, LOW_GRASS)
            ctx.lineTo(x + 4, HIGH_GRASS)
        }
        ctx.lineTo(WIDTH, HEIGHT)
        ctx.fill()
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

        this.update(elapsedTime)
        this.draw()

        if (this.isLooping) {
            requestAnimationFrame(() => this.mainTick())
        }
    }

    createMonkey(): number {
        const monkey = new Monkey(new Vector(0, 0), this)
        this.monkeys.set(monkey.id, monkey)

        return monkey.id
    }

    removeMonkey(id: number) {
        this.monkeys.delete(id)
    }

    async executeCommand(id: number, command: MoveCommand): Promise<void> {
        const monkey = this.monkeys.get(id)

        await monkey?.executeCommand(command)
    }

    update(elapsedTime: number) {
        this.monkeys.values().forEach(monkey => {
            monkey.update(elapsedTime)
        })
    }
}