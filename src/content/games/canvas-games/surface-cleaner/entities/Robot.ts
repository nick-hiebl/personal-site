import { lerp } from '../../core/animation'
import { randomChoice } from '../../core/random'
import { Vector } from '../../core/Vector'
import type { SurfaceCleanerGame } from '../game'
import { RobotSettings } from '../settings/RobotSettings'
import { SiloSettings } from '../settings/SiloSettings'
import { BUNDLE_SCALE } from '../world/constants'

import { nextEntityId } from './entity-id'

type Path = {
    primary: 'x' | 'y'
    currentSecondaryStep: number
    primaryDirection: 1 | -1
    secondaryDirection: 1 | -1
    acting: 'initial' | 'initial-return' | 'primary' | 'secondary'
    initialSecondary: number
}

export class Robot {
    id: number
    position: Vector
    store: number

    assignment: Vector | undefined
    path: Path | undefined

    payloadTime: number | undefined
    payloadStartStore: number | undefined

    decaying: boolean
    private deathTimer: number | undefined
    dead: boolean

    constructor(position: Vector) {
        this.id = nextEntityId()
        this.position = position
        this.store = 0

        this.assignment = undefined
        this.path = undefined

        this.decaying = false
        this.dead = false
    }

    getBoundingBox(): [Vector, Vector] {
        return [
            new Vector(Math.ceil(this.position.x - RobotSettings.radius), Math.ceil(this.position.y - RobotSettings.radius)),
            new Vector(Math.floor(this.position.x + RobotSettings.radius), Math.floor(this.position.y + RobotSettings.radius)),
        ]
    }

    resetState() {
        this.assignment = undefined
        this.path = undefined
    }

    draw(ctx: CanvasRenderingContext2D, topLeft: Vector) {
        const color = this.decaying
            ? 'yellow'
            : this.payloadTime && this.payloadTime > 0
                ? 'purple'
                : this.store > RobotSettings.storeCap
                    ? '#0077ff'
                    : 'green'

        const progressFraction = this.payloadTime && this.payloadTime > 0
            ? lerp(this.payloadTime / RobotSettings.payloadTime, this.store, this.payloadStartStore ?? 0) / RobotSettings.storeCap
            : this.store / RobotSettings.storeCap

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.ellipse(
            this.position.x - topLeft.x,
            this.position.y - topLeft.y,
            4,
            4,
            0,
            0,
            2 * Math.PI * progressFraction,
        )
        ctx.lineTo(this.position.x - topLeft.x, this.position.y - topLeft.y)
        ctx.fill()

        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.ellipse(
            this.position.x - topLeft.x,
            this.position.y - topLeft.y,
            4,
            4,
            0,
            0,
            2 * Math.PI
        )
        ctx.stroke()
    }

    update(elapsedTime: number, game: SurfaceCleanerGame) {
        if (this.decaying && (this.deathTimer ?? 0) > 0) {
            this.deathTimer = (this.deathTimer ?? 0) - elapsedTime

            if (this.deathTimer <= 0) {
                this.dead = true
                game.money += RobotSettings.cost
            }

            return
        }

        const grid = game.worldGrid

        if (this.payloadTime && this.payloadTime > 0) {
            this.payloadTime -= elapsedTime
            return
        }

        let shouldLaunch = this.store >= RobotSettings.storeCap

        // Check if we need to launch before decaying
        if (!shouldLaunch && !this.assignment && this.store > 0) {
            const nextAssign = grid.findAssignment(this.position, this.id)

            if (!nextAssign) {
                shouldLaunch = true
            } else {
                this.assignment = nextAssign
                this.path = undefined
                return
            }
        }

        if (shouldLaunch) {
            const targets = game.silos.filter((silo) => {
                return silo.payloadTime <= 0 && SiloSettings.storeCap - silo.store > RobotSettings.minPayload
            })

            if (targets.length === 0) {
                return
            }

            const target = randomChoice(targets)

            if (!target) {
                return
            }

            const transferrableAmount = Math.min(
                SiloSettings.storeCap - target.store,
                this.store,
            )

            this.payloadStartStore = this.store
            this.payloadTime = RobotSettings.payloadTime

            target.triggerAnimation(transferrableAmount)
            this.store -= transferrableAmount

            return
        }

        if (!this.assignment) {
            const nextAssign = grid.findAssignment(this.position, this.id)

            if (!nextAssign) {
                this.decaying = true
                this.deathTimer = RobotSettings.deathTime
                return
            }

            this.assignment = nextAssign
            this.path = undefined
            return
        }

        if (grid.isComplete(this.assignment)) {
            this.assignment = undefined
            this.path = undefined
            return
        }

        if (this.path) {
            const mov = this.getPathDirection(this.assignment, this.path)

            const distanceToTravel = elapsedTime / 1000 * RobotSettings.speed

            const realMove = new Vector(
                Math.sign(mov.x) * Math.max(0, Math.min(distanceToTravel, Math.abs(mov.x))),
                Math.sign(mov.y) * Math.max(0, Math.min(distanceToTravel, Math.abs(mov.y))),
            )

            this.position = this.position.add(realMove)
            return
        }

        const distance = this.position.diff(this.assignment)

        if (distance.x >= 0 && distance.x <= BUNDLE_SCALE && distance.y >= 0 && distance.y <= BUNDLE_SCALE) {
            const centerX = this.assignment.x + BUNDLE_SCALE / 2
            const centerY = this.assignment.y + BUNDLE_SCALE / 2

            const xProgress = this.position.x - centerX
            const yProgress = this.position.y - centerY

            if (Math.abs(xProgress) > Math.abs(yProgress)) {
                // Go x-ways
                this.path = {
                    primary: 'y',
                    currentSecondaryStep: this.position.x,
                    primaryDirection: yProgress > 0 ? 1 : -1,
                    secondaryDirection: xProgress > 0 ? 1 : -1,
                    acting: 'initial',
                    initialSecondary: this.position.x,
                }
            } else {
                this.path = {
                    primary: 'x',
                    currentSecondaryStep: this.position.y,
                    primaryDirection: xProgress > 0 ? 1 : -1,
                    secondaryDirection: yProgress > 0 ? 1 : -1,
                    acting: 'initial',
                    initialSecondary: this.position.y,
                }
            }

            return
        }

        const targetX = Math.max(Math.min(this.assignment.x + BUNDLE_SCALE, this.position.x), this.assignment.x)
        const targetY = Math.max(Math.min(this.assignment.y + BUNDLE_SCALE, this.position.y), this.assignment.y)

        const motion = new Vector(
            Math.sign(targetX - this.position.x),
            Math.sign(targetY - this.position.y),
        )

        this.position = this.position.add(motion.scale(elapsedTime / 1000 * RobotSettings.speed))
    }

    determineMovement(path: Path, _primary: number, secondary: number, primaryProgress: number, secondaryProgress: number): [number, number] {
        if (path.acting === 'initial' || path.acting === 'initial-return') {
            const nextPath: Path = path.acting === 'initial'
                ? {
                    ...path,
                    primaryDirection: (-path.primaryDirection) as 1 | -1,
                    acting: 'initial-return',
                }
                : {
                    ...path,
                    primaryDirection: (-path.primaryDirection) as 1 | -1,
                    acting: 'secondary',
                    currentSecondaryStep: secondary,
                    initialSecondary: secondary,
                }

            if (primaryProgress / path.primaryDirection >= BUNDLE_SCALE / 2 - RobotSettings.radius) {
                this.path = nextPath
                return [0, 0]
            } else {
                return [
                    path.primaryDirection * (BUNDLE_SCALE / 2) - primaryProgress,
                    0,
                ]
            }
        } else if (path.acting === 'secondary') {
            const nextStepSecondary = path.currentSecondaryStep + (RobotSettings.radius * 2 - 2) / path.secondaryDirection
            
            if ((secondary - nextStepSecondary) / path.secondaryDirection >= 0) {
                this.path = {
                    ...path,
                    acting: 'primary',
                    currentSecondaryStep: secondary,
                }
                return [0, 0]
            } else if (secondaryProgress / path.secondaryDirection >= BUNDLE_SCALE / 2 + RobotSettings.radius) {
                this.path = {
                    ...path,
                    currentSecondaryStep: path.initialSecondary + path.secondaryDirection * RobotSettings.radius,
                    secondaryDirection: (-path.secondaryDirection) as 1 | -1,
                }
                return [0, 0]
            } else {
                return [0, nextStepSecondary - secondary]
            }
        } else if (path.acting === 'primary') {
            if (primaryProgress / path.primaryDirection >= BUNDLE_SCALE / 2 - RobotSettings.radius) {
                this.path = {
                    ...path,
                    acting: 'secondary',
                    currentSecondaryStep: secondary,
                    primaryDirection: (-path.primaryDirection) as 1 | -1,
                }
                return [0, 0]
            }
            const target = path.primaryDirection * BUNDLE_SCALE / 2
            return [
                target - primaryProgress,
                0,
            ]
        }

        return [0, 0]
    }

    getPathDirection(assignment: Vector, path: Path): Vector {
        const centerX = assignment.x + BUNDLE_SCALE / 2
        const centerY = assignment.y + BUNDLE_SCALE / 2
        const xProgress = this.position.x - centerX
        const yProgress = this.position.y - centerY

        if (path.primary === 'x') {
            const [primary, secondary] = this.determineMovement(path, this.position.x, this.position.y, xProgress, yProgress)

            return new Vector(primary, secondary)
        } else {
            const [primary, secondary] = this.determineMovement(path, this.position.y, this.position.x, yProgress, xProgress)

            return new Vector(secondary, primary)
        }
    }
}
