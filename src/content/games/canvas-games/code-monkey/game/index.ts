import { Vector } from '../../core/Vector'

import { Monkey } from './monkey'
import { type Animation, delay as rawDelay, lerp, type ExternalStore, createExternalStore, smoothStep, randInt } from './utils'

const WIDTH = 800
const HEIGHT = 600

const SCALE = 40

const GROW_SPEED = 400
const BANANA_GROW_TIME = 1000
const REPORT_DELAY = 2000
const HARVEST_DURATION = 300

const TREE_WIDTH = SCALE * 0.4

export type MonkeyCommand = 'left' | 'right' | 'up' | 'down'

type Tree = {
    type: 'Banana' | 'Orange'
    height: number
    eventualHeight: number
    currentHeight: number
    growAnimation?: Animation<number>
    fruitAnimation?: Animation<number>
    hasFruit: boolean
    isGrown: boolean
}

type FruitCount = {
    bananas: number
    oranges: number
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
    fruitCount: FruitCount
    fruitsStore: ExternalStore<FruitCount>

    speedMulti: number = 1

    constructor() {
        this.width = WIDTH / SCALE
        this.height = HEIGHT / SCALE

        this.canvas = null
        this.ctx = null

        this.isLooping = false
        this.lastTime = performance.now()

        this.monkeys = new Map()
        this.fruitCount = {
            bananas: 0,
            oranges: 0,
        }
        this.fruitsStore = createExternalStore(() => this.fruitCount)

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

            const treeWidth = tree.type === 'Banana'
                ? TREE_WIDTH
                : TREE_WIDTH * 0.5

            ctx.fillStyle = '#ad7344'
            ctx.fillRect(
                x * SCALE + (SCALE - treeWidth) / 2,
                HEIGHT - tree.currentHeight * SCALE,
                treeWidth,
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

            if (tree.hasFruit || tree.fruitAnimation) {
                if (tree.type === 'Banana') {
                    ctx.save()
                    const bananaY = HEIGHT - (tree.currentHeight - 0.33) * SCALE
                    ctx.translate((x + 0.5) * SCALE, bananaY)
                    if (tree.fruitAnimation) {
                        const zoomScale = tree.fruitAnimation.progress / tree.fruitAnimation.duration
    
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
                } else if (tree.type === 'Orange') {
                    const radiusScale = tree.fruitAnimation
                        ? smoothStep(tree.fruitAnimation.progress / tree.fruitAnimation.duration)
                        : 1

                    ctx.fillStyle = '#ed6415'
                    ctx.beginPath()
                    ctx.ellipse(
                        (x + 0.62) * SCALE,
                        HEIGHT - (tree.currentHeight - 0.13) * SCALE,
                        SCALE * 0.2 * radiusScale,
                        SCALE * 0.2 * radiusScale,
                        0, 0, 2 * Math.PI,
                    )
                    ctx.fill()
                }
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
                    tree.fruitAnimation = {
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

            if (tree.fruitAnimation) {
                tree.fruitAnimation.progress += elapsedTime

                if (tree.fruitAnimation.progress >= tree.fruitAnimation.duration) {
                    tree.hasFruit = true
                    tree.fruitAnimation = undefined
                    tree.isGrown = true
                }
            }
        })

        this.monkeys.values().forEach((monkey) => {
            monkey.update(elapsedTime)
        })
    }

    canHarvest(x: number, y: number): boolean {
        const tree = this.trees[x]

        return !!tree && tree.hasFruit && tree.height === y + 1
    }

    async harvest(x: number, y: number): Promise<boolean> {
        if (!this.canHarvest(x, y)) {
            await this.delay(HARVEST_DURATION)
            return false
        }

        const tree = this.trees[x]

        if (!tree || !tree.hasFruit) {
            throw Error('canHarvest returned true but there is no tree here!')
        }

        await this.delay(HARVEST_DURATION)
        if (tree.hasFruit) {
            if (tree.type === 'Banana') {
                tree.hasFruit = false
                this.addBanana()
            } else if (tree.type === 'Orange') {
                tree.hasFruit = false
                const someTallerUnharvested = this.trees.some((t) =>
                    t?.type === 'Orange' &&
                    // Taller
                    t.eventualHeight > tree.eventualHeight &&
                    // Any incomplete state
                    (t.hasFruit || t.growAnimation || t.fruitAnimation)
                )
                if (someTallerUnharvested) {
                    console.log('Some taller tree was available')
                    return true
                }

                const someShorterHarvested = this.trees.some((t) =>
                    t?.type === 'Orange' &&
                    // Shorter
                    t.eventualHeight < tree.eventualHeight &&
                    // Harvested
                    !t.growAnimation && !t.fruitAnimation && !t.hasFruit
                )
                if (someShorterHarvested) {
                    console.log('Some shorter tree already harvested')
                    return true
                }

                const someTreeOfDifferentHeight = this.trees.some((t) =>
                    t?.type === 'Orange' &&
                    t.eventualHeight !== tree.eventualHeight
                )
                if (!someTreeOfDifferentHeight) {
                    console.log('No different trees')
                    return true
                }

                this.addOrange()
                return true
            } else {
                throw Error('Harvested unhandled tree type!')
            }
            return true
        }
        return false
    }

    async report(n: number): Promise<boolean> {
        if (n === 0) {
            this.trees.forEach((tree, index) => {
                if (tree?.type === 'Orange') {
                    this.trees[index] = null
                }
            })
            return true
        }

        const someBananaTreesUnharvested = this.trees.some((t) =>
            t?.type === 'Banana' &&
            t.currentHeight === t.eventualHeight &&
            !t.fruitAnimation &&
            t.hasFruit
        )

        if (someBananaTreesUnharvested) {
            await this.delay(REPORT_DELAY)
            return false
        }

        const trueResult = this.trees.reduce((total, tree) => {
            if (tree?.type !== 'Banana') {
                return total
            }

            return tree.height + total
        }, 0)

        if (n !== trueResult) {
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
        this.fruitCount.bananas += 1
        this.fruitCount = { ...this.fruitCount }
        this.fruitsStore.triggerUpdate()
    }

    async addOrange() {
        this.fruitCount.oranges += 1
        this.fruitCount = { ...this.fruitCount }
        this.fruitsStore.triggerUpdate()
    }

    plantTree(x: number, plantType: 'Banana' | 'Orange') {
        if (this.trees[x] || this.trees[x] === undefined) {
            return
        }

        const targetHeight = plantType === 'Banana'
            ? randInt(4, this.height + 1)
            : randInt(1, 4)

        this.trees[x] = {
            type: plantType,
            eventualHeight: targetHeight,
            currentHeight: 0,
            height: 0,
            hasFruit: false,
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