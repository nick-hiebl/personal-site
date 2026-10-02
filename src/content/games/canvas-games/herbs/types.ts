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

export type Surface = Rect & {
    id: number
    animation?: Animation
    documents?: Document[]
    inset: number
    draw?: (surface: Surface) => void
    trigger?: Rect & {
        parentShift: Vector
        enabled: boolean
        hovered: boolean
        onSurface: boolean
    }
}

export type Document = {
    position: Vector
    interaction?: {
        hovered: true
        grabbed: boolean
        offset: Vector
    }
    animation?: Animation
    shape: HTMLCanvasElement | HTMLImageElement
    size: Vector
    surfaceId: number
}
