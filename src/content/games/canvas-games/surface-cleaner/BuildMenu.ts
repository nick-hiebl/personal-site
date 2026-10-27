import { createExternalStore, type ExternalStore } from '../core/external-store'

import type { SurfaceCleanerGame } from './game'

type BuildMenuOption = 'robot'

export type BuildMenuType = {
    open: boolean
    options: BuildMenuOption[]
    selected?: BuildMenuOption
}

const OPTIONS: BuildMenuOption[] = ['robot']

export class BuildMenu {
    state: BuildMenuType

    store: ExternalStore<BuildMenuType>

    constructor() {
        this.store = createExternalStore(() => this.state)

        this.state = {
            open: false,
            options: OPTIONS,
        }
    }

    setOpen(input: boolean | ((currentlyOpen: boolean) => boolean)) {
        if (typeof input === 'boolean') {
            this.state = {
                ...this.state,
                open: input,
                selected: undefined,
            }
            this.store.triggerUpdate()
        } else {
            const nextState = input(this.state.open)

            if (nextState !== this.state.open) {
                this.state = {
                    ...this.state,
                    open: nextState,
                    selected: undefined,
                }
                this.store.triggerUpdate()
            }
        }
    }

    select(option: BuildMenuOption | undefined) {
        if (this.state.selected === option) {
            return
        }

        if (option === undefined) {
            this.state = {
                ...this.state,
                selected: undefined,
            }
            this.store.triggerUpdate()
        } else if (this.state.options.includes(option)) {
            this.state = {
                ...this.state,
                selected: option,
            }
            this.store.triggerUpdate()
        }
    }
}
