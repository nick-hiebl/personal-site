import { Vector } from '../../core/Vector'

import { Monkey } from './monkey'
import { type Animation, delay as rawDelay, lerp, type ExternalStore, createExternalStore } from './utils'

const WIDTH = 800
const HEIGHT = 600

const SCALE = 40

const GROW_SPEED = 400
const BANANA_GROW_TIME = 1000
const REPORT_DELAY = 2000

const TREE_WIDTH = SCALE * 0.4

export type MonkeyCommand = 'left' | 'right' | 'up' | 'down' | 'plant'

type Tree = {
    height: number
    eventualHeight: number
    currentHeight: number
    growAnimation?: Animation<number>
    bananaAnimation?: Animation<number>
    hasBanana: boolean
    isGrown: boolean
}

export class MonkeyGame {
    width: number
    height: number

    canvas: HTMLCanvasElement | null
    ctx: CanvasRenderingContext2D | null

    isLooping: boolean
    lastTime: number

    monkeys: Map<number, Monkey>

    trees: (Tree | null)[]
    bananas: number
    bananaStore: ExternalStore<number>

    speedMulti: number = 1

    constructor() {
        this.width = WIDTH / SCALE
        this.height = HEIGHT / SCALE

        this.canvas = null
        this.ctx = null

        this.isLooping = false
        this.lastTime = performance.now()

        this.monkeys = new Map()
        this.bananas = 0
        this.bananaStore = createExternalStore(() => this.bananas)

        this.trees = new Array(this.width).fill(null)
    }

    async delay(ms: number) {
        await rawDelay(ms / this.speedMulti)
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

        this.trees.forEach((tree, x) => {
            if (!tree) {
                return
            }

            ctx.fillStyle = '#ad7344'
            ctx.fillRect(
                x * SCALE + (SCALE - TREE_WIDTH) / 2,
                HEIGHT - tree.currentHeight * SCALE,
                TREE_WIDTH,
                tree.currentHeight * SCALE,
            )

            ctx.fillStyle = 'green'
            ctx.beginPath()
            ctx.ellipse(
                (x + 0.5) * SCALE,
                HEIGHT - tree.currentHeight * SCALE,
                SCALE * 0.48,
                SCALE * 0.32,
                0,
                0,
                2 * Math.PI,
            )
            ctx.fill()

            if (tree.hasBanana || tree.bananaAnimation) {
                ctx.save()
                const bananaY = HEIGHT - (tree.currentHeight - 0.33) * SCALE
                ctx.translate((x + 0.5) * SCALE, bananaY)
                if (tree.bananaAnimation) {
                    const zoomScale = tree.bananaAnimation.progress / tree.bananaAnimation.duration

                    ctx.scale(zoomScale, zoomScale)
                }
                ctx.fillStyle = 'yellow'

                ctx.beginPath()
                ctx.ellipse(
                    0,
                    0,
                    SCALE * 0.24,
                    SCALE * 0.24,
                    0,
                    -Math.PI / 2,
                    Math.PI / 2,
                )
                ctx.ellipse(
                    -0.2 * SCALE,
                    0,
                    SCALE * 0.3,
                    SCALE * 0.3,
                    0,
                    Math.PI / 3,
                    -Math.PI / 3,
                    true,
                )
                ctx.fill()

                ctx.restore()
            }
        })

        this.monkeys.values().forEach((monkey) => {
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

        this.update(elapsedTime * this.speedMulti)
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

    async executeCommand(id: number, command: MonkeyCommand): Promise<void> {
        const monkey = this.monkeys.get(id)

        await monkey?.executeCommand(command)
    }

    update(elapsedTime: number) {
        this.trees.forEach((tree) => {
            if (!tree) {
                return
            }

            if (tree.growAnimation) {
                tree.growAnimation.progress += elapsedTime

                if (tree.growAnimation.progress >= tree.growAnimation.duration) {
                    tree.height = tree.growAnimation.to
                    tree.currentHeight = tree.height
                    tree.bananaAnimation = {
                        progress: 0,
                        duration: BANANA_GROW_TIME,
                        from: 0,
                        to: 1,
                    }
                    tree.growAnimation = undefined
                } else {
                    const h = lerp(
                        tree.growAnimation.progress / tree.growAnimation.duration,
                        tree.growAnimation.from,
                        tree.growAnimation.to,
                    )

                    tree.currentHeight = h
                    tree.height = Math.floor(h)
                }
            }

            if (tree.bananaAnimation) {
                tree.bananaAnimation.progress += elapsedTime

                if (tree.bananaAnimation.progress >= tree.bananaAnimation.duration) {
                    tree.hasBanana = true
                    tree.bananaAnimation = undefined
                    tree.isGrown = true
                }
            }
        })

        this.monkeys.values().forEach((monkey) => {
            monkey.update(elapsedTime)
        })
    }

    async report(n: number) {
        if (!this.trees.every((t) => !!t && t.height === t.eventualHeight && !t.bananaAnimation && !t.hasBanana)) {
            await this.delay(REPORT_DELAY)
            return false
        }

        const trueResult = this.trees.reduce((total, tree) => {
            return tree!.height + total
        }, 0)

        if (n !== trueResult) {
            console.log('Reported', n, 'expected', trueResult)
            await this.delay(REPORT_DELAY)
            return false
        }
        this.trees.forEach((_, index) => {
            this.trees[index] = null
        })
        await this.delay(REPORT_DELAY)
        return true
    }

    async addBanana() {
        this.bananas += 1
        this.bananaStore.triggerUpdate()
    }

    plantTree(x: number) {
        if (this.trees[x] || this.trees[x] === undefined) {
            return
        }

        const targetHeight = Math.ceil(Math.random() * this.height)

        this.trees[x] = {
            eventualHeight: targetHeight,
            currentHeight: 0,
            height: 0,
            hasBanana: false,
            growAnimation: {
                progress: 0,
                duration: targetHeight * GROW_SPEED,
                from: 0,
                to: targetHeight,
            },
            isGrown: false,
        }
    }
}