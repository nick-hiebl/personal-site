import type { Vector } from '../core/Vector'

export type Rect = {
    position: Vector
    size: Vector
}

export type Animation = {
    startPos: Vector
    endPos: Vector
    duration: number
    progress: number
}

export type SurfaceI = Rect & {
    id: number
    name: string
    containsSurfacePoint(point: Vector): boolean
    draw(ctx: CanvasRenderingContext2D): void
    animation?: Animation
    documents?: DocumentI[]
    inset: number
    trigger?: Rect & {
        parentShift: Vector
        enabled: boolean
        hovered: boolean
        onSurface: boolean
        animSpeed: number
    }
}

export type DocumentI = {
    position: Vector
    interaction?: {
        hovered: true
        grabbed: boolean
        offset: Vector
    }
    animation?: Animation
    shape: HTMLCanvasElement | HTMLImageElement
    size: Vector
    surface: SurfaceI
}

export type CursorMode =
    | 'cursor'
    | 'can-grab'
    | 'grabbing'
    | 'point'
