import { useSyncExternalStore } from "react"

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

export const useStore = <T>(store: ExternalStore<T>) => {
    return useSyncExternalStore(store.subscribe, store.getSnapshot)
}
