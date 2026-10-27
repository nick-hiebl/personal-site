export const delay = (ms: number) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), ms)
    })
}

export type Animation<T> = {
    progress: number
    duration: number
    step?: (t: number) => number
    from: T
    to: T
}

export const smoothStep = (t: number): number => 3 * t * t - 2 * t * t * t
export const fastStep = (t: number): number => t * (2 - t)

export const lerp = (t: number, a: number, b: number): number => {
    return (1 - t) * a + t * b
}

// TODO: Replace with core/external-store
export type ExternalStore<T> = {
    getSnapshot(): T
    subscribe(listener: () => void): () => void
    triggerUpdate: () => void
}

export const createExternalStore = <T>(getSnapshot: () => T): ExternalStore<T> => {
    const listeners: (() => void)[] = []

    const subscribe = (listener: () => void): () => void => {
        listeners.push(listener)

        return () => {
            const index = listeners.findIndex(l => l === listener)

            if (index === -1) {
                return
            }

            listeners.splice(index, 1)
        }
    }

    const triggerUpdate = () => {
        for (const listener of listeners) {
            listener()
        }
    }

    return {
        subscribe,
        getSnapshot,
        triggerUpdate,
    }
}

export const randInt = (low: number, high: number): number => {
    return Math.floor((high - low) * Math.random() + low)
}
