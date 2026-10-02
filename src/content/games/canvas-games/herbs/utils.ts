import { Vector } from '../core/Vector'

import type { Document, Rect, Surface } from './types'

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

export const clampToSurface = (surface: Surface, position: Vector, size: Vector): Vector => {
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

export const isSurface = (item: Surface | Document | undefined): item is Surface => {
    return !!item && typeof item === 'object' && 'id' in item
}
