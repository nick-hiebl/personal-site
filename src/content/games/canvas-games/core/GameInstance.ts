import { Vector } from './Vector'

export class GameInstance {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    isLooping: boolean
    lastTime: number

    mousePos: Vector | undefined
    mouseDown: boolean
    keys: Map<string, boolean>

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        const ctx = canvas.getContext('2d')

        if (!ctx) {
            throw Error('No canvas provided!')
        }

        this.ctx = ctx

        this.ctx.clearRect(0, 0, canvas.width, canvas.height)

        this.isLooping = false
        this.lastTime = performance.now()

        this.mouseDown = false
        this.keys = new Map()

        this.canvas.addEventListener('mousemove', e => {
            const box = this.canvas.getBoundingClientRect()

            this.mousePos = new Vector(
                (e.clientX - box.x) / box.width * canvas.width,
                (e.clientY - box.y) / box.height * canvas.height,
            )
        })

        this.canvas.addEventListener('mouseleave', () => {
            this.mousePos = undefined
            this.mouseDown = false
        })

        this.canvas.addEventListener('mousedown', () => {
            this.mouseDown = true
        })

        this.canvas.addEventListener('mouseup', () => {
            this.mouseDown = false
        })

        this.canvas.addEventListener('contextmenu', e => {
            e.preventDefault()
        })

        document.addEventListener('keydown', e => {
            this.keys.set(e.code, true)
        })

        document.addEventListener('keyup', e => {
            this.keys.set(e.code, false)
        })
    }

    start() {
        this.isLooping = true
        this.lastTime = performance.now()

        this.mainTick()
    }

    mainTick() {
        const currentTime = performance.now()

        const elapsedTime = currentTime - this.lastTime

        this.lastTime  = currentTime

        this.update(elapsedTime)
        this.draw()

        if (this.isLooping) {
            requestAnimationFrame(() => this.mainTick())
        }
    }

    update(elapsedTime: number) {}

    draw() {}
}
