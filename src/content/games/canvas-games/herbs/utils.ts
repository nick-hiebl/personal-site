import { Vector } from '../core/Vector'

import type { DocumentI, Rect, SurfaceI } from './types'

let nextId = 0
export const createId = () => nextId++

export const rectToDetails = (rect: Rect): [number, number, number, number] => {
    return [rect.position.x, rect.position.y, rect.size.x, rect.size.y]
}

export const randInt = (a: number, b: number): number => {
    return Math.floor(Math.random() * (b - a)) + a
}

export const returnFirst = <T, U>(list: T[], predicate: (item: T) => U | undefined | false): U | undefined => {
    for (const item of list) {
        const res = predicate(item)

        if (res) {
            return res
        }
    }
}

export const returnFirstLast = <T, U>(list: T[], predicate: (item: T) => U | undefined | false): U | undefined => {
    for (let i = list.length - 1; i >= 0; i--) {
        const res = predicate(list[i])

        if (res) {
            return res
        }
    }
}

export const overlaps = (dist: Vector, size: Vector): boolean => {
    return Math.abs(dist.x) < size.x / 2 && Math.abs(dist.y) < size.y / 2
}

export const overlapsRect = (rect: Rect, pos: Vector): boolean => {
    return rect.position.x <= pos.x &&
        pos.x <= rect.position.x + rect.size.x &&
        rect.position.y <= pos.y &&
        pos.y <= rect.position.y + rect.size.y
}

export const clamp = (value: number, low: number, high: number): number => {
    return Math.max(low, Math.min(value, high))
}

export const clampToSurface = (surface: SurfaceI, position: Vector, size: Vector): Vector => {
    const realPos = position.diff(surface.position)
    const insetX = surface.inset + size.x / 2
    const insetY = surface.inset + size.y / 2

    return new Vector(
        clamp(realPos.x, insetX, surface.size.x - insetX),
        clamp(realPos.y, insetY, surface.size.y - insetY),
    )
}

export const smoothStep = (t: number): number => 3 * t * t - 2 * t * t * t
export const fastStep = (t: number): number => t * (2 - t)

export const lerp = (t: number, a: number, b: number): number => {
    return (1 - t) * a + t * b
}

export const lerpVector = (t: number, a: Vector, b: Vector): Vector => {
    return a.scale(1 - t).add(b.scale(t))
}

export const isSurface = (item: SurfaceI | DocumentI | undefined): item is SurfaceI => {
    return !!item && typeof item === 'object' && 'id' in item
}

export const insetRect = (rect: Rect, insetBy: number): Rect => {
    return {
        position: rect.position.add(new Vector(insetBy, insetBy)),
        size: rect.size.diff(new Vector(insetBy, insetBy).scale(2)),
    }
}

export const divideToGrid = (container: Rect, count: number, perRow: number, gap: number): Rect[] => {
    const numRows = Math.ceil(count / perRow)

    const xSize = (container.size.x - (perRow - 1) * gap) / perRow
    const ySize = (container.size.y - (numRows - 1) * gap) / numRows

    return new Array(count).fill(0).map((_, index) => {
        const row = Math.floor(index / perRow)
        const col = index % perRow

        return {
            position: new Vector(
                col * (xSize + gap),
                row * (ySize + gap),
            ),
            size: new Vector(xSize, ySize),
        }
    }).map(rect => ({ ...rect, position: rect.position.add(container.position) }))
}

export const divideToFixedHeightGrid = (container: Rect, count: number, perRow: number, gap: number, cellHeight: number): Rect[] => {
    const xSize = (container.size.x - (perRow - 1) * gap) / perRow

    return new Array(count).fill(0).map((_, index) => {
        const row = Math.floor(index / perRow)
        const col = index % perRow

        return {
            position: new Vector(
                col * (xSize + gap),
                row * (cellHeight + gap),
            ),
            size: new Vector(xSize, cellHeight),
        }
    }).map(rect => ({ ...rect, position: rect.position.add(container.position) }))
}
