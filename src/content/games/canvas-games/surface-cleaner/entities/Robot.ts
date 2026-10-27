import { Vector } from '../../core/Vector'
import { RobotSettings } from '../settings/Robot'
import { BUNDLE_SCALE } from '../world/constants'
import type { WorldGrid } from '../world/WorldGrid'

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

    constructor(position: Vector) {
        this.id = nextEntityId()
        this.position = position
        this.store = 0

        this.assignment = undefined
        this.path = undefined
    }

    getBoundingBox(): [Vector, Vector] {
        return [
            new Vector(Math.ceil(this.position.x - RobotSettings.radius), Math.ceil(this.position.y - RobotSettings.radius)),
            new Vector(Math.floor(this.position.x + RobotSettings.radius), Math.floor(this.position.y + RobotSettings.radius)),
        ]
    }

    draw(ctx: CanvasRenderingContext2D, topLeft: Vector) {
        ctx.fillStyle = 'green'
        ctx.beginPath()
        ctx.ellipse(
            this.position.x - topLeft.x,
            this.position.y - topLeft.y,
            4,
            4,
            0,
            0,
            2 * Math.PI * this.store / RobotSettings.storeCap,
        )
        ctx.lineTo(this.position.x - topLeft.x, this.position.y - topLeft.y)
        ctx.fill()

        ctx.beginPath()
        ctx.strokeStyle = 'green'
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

        if (this.assignment) {
            ctx.strokeStyle = '#00aaff60'
            ctx.beginPath()
            ctx.moveTo(this.position.x - topLeft.x, this.position.y - topLeft.y)
            ctx.lineTo(this.assignment.x - topLeft.x, this.assignment.y - topLeft.y)
            ctx.stroke()
        }
    }

    update(elapsedTime: number, grid: WorldGrid) {
        if (this.store > RobotSettings.storeCap) {
            return
        }

        if (!this.assignment) {
            this.assignment = grid.findAssignment(this.position, this.id)
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

            this.position = this.position.add(mov.scale(elapsedTime / 1000 * RobotSettings.speed))
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

    getPathDirection(assignment: Vector, path: Path): Vector {
        const centerX = assignment.x + BUNDLE_SCALE / 2
        const centerY = assignment.y + BUNDLE_SCALE / 2
        const xProgress = this.position.x - centerX
        const yProgress = this.position.y - centerY

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
                }

            if (path.primary === 'x') {
                if (xProgress / path.primaryDirection >= BUNDLE_SCALE / 2 - RobotSettings.radius) {
                    this.path = nextPath
                    return new Vector(0, 0)
                } else {
                    return new Vector(path.primaryDirection, 0)
                }
            } else if (path.primary === 'y') {
                if (yProgress / path.primaryDirection >= BUNDLE_SCALE / 2 - RobotSettings.radius) {
                    this.path = nextPath
                    return new Vector(0, 0)
                } else {
                    return new Vector(0, path.primaryDirection)
                }
            }
        } else if (path.acting === 'secondary') {
            if (path.primary === 'x') {
                if (
                    (path.currentSecondaryStep - centerY) / path.secondaryDirection >= BUNDLE_SCALE / 2 - RobotSettings.radius ||
                    yProgress / path.secondaryDirection >= BUNDLE_SCALE / 2 + RobotSettings.radius
                ) {
                    this.path = {
                        ...path,
                        currentSecondaryStep: path.initialSecondary,
                        secondaryDirection: (-path.secondaryDirection) as 1 | -1,
                    }
                    return new Vector(0, 0)
                }
                const yDist = (this.position.y - path.currentSecondaryStep) / path.secondaryDirection
                if (yDist > RobotSettings.radius * 1.5) {
                    this.path = {
                        ...path,
                        acting: 'primary',
                        currentSecondaryStep: this.position.y,
                    }
                    return new Vector(0, 0)
                } else {
                    return new Vector(0, path.secondaryDirection)
                }
            } else {
                if (
                    (path.currentSecondaryStep - centerX) / path.secondaryDirection >= BUNDLE_SCALE / 2 - RobotSettings.radius ||
                    xProgress / path.secondaryDirection >= BUNDLE_SCALE / 2 + RobotSettings.radius
                ) {
                    this.path = {
                        ...path,
                        currentSecondaryStep: path.initialSecondary,
                        secondaryDirection: (-path.secondaryDirection) as 1 | -1,
                    }
                    return new Vector(0, 0)
                }
                const xDist = (this.position.x - path.currentSecondaryStep) / path.secondaryDirection
                if (Math.abs(xDist) > RobotSettings.radius * 1.5) {
                    this.path = {
                        ...path,
                        acting: 'primary',
                        currentSecondaryStep: this.position.x,
                    }
                    return new Vector(0, 0)
                } else {
                    return new Vector(path.secondaryDirection, 0)
                }
            }
        } else if (path.acting === 'primary') {
            if (path.primary === 'x') {
                const centerX = assignment.x + BUNDLE_SCALE / 2
                const distAlong = this.position.x - centerX
                if (distAlong / path.primaryDirection > BUNDLE_SCALE / 2 - RobotSettings.radius) {
                    this.path = {
                        ...path,
                        acting: 'secondary',
                        primaryDirection: (-path.primaryDirection) as 1 | -1,
                    }
                    return new Vector(0, 0)
                }
                return new Vector(path.primaryDirection, 0)
            } else {
                const centerY = assignment.y + BUNDLE_SCALE / 2
                const distAlong = this.position.y - centerY
                if (distAlong / path.primaryDirection > BUNDLE_SCALE / 2 - RobotSettings.radius) {
                    this.path = {
                        ...path,
                        acting: 'secondary',
                        primaryDirection: (-path.primaryDirection) as 1 | -1,
                    }
                    return new Vector(0, 0)
                }
                return new Vector(0, path.primaryDirection)
            }
        }

        return new Vector(0, 0)
    }
}
