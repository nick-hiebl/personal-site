import { createExternalStore, type ExternalStore } from '../core/external-store'

import type { SurfaceCleanerGame } from './game'
import { RobotSettings } from './settings/Robot'

type BuildMenuOption = 'robot'

export type BuildMenuType = {
    open: boolean
    options: { id: BuildMenuOption; cost: number; canAfford: boolean }[]
    selected?: BuildMenuOption
}

const OPTIONS: [BuildMenuOption, number][] = [['robot', RobotSettings.cost]]

export class BuildMenu {
    state: BuildMenuType

    store: ExternalStore<BuildMenuType>

    constructor() {
        this.store = createExternalStore(() => this.state)

        this.state = {
            open: false,
            options: OPTIONS.map(([id, cost]) => ({
                id,
                cost,
                canAfford: false,
            })),
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

    onUpdateMoney(money: number) {
        const dirty = this.state.options.some((option) => {
            const canAfford = option.cost <= money

            return canAfford !== option.canAfford
        })

        if (dirty) {
            this.state = {
                ...this.state,
                options: this.state.options.map((option) => {
                    const canAfford = option.cost <= money

                    if (canAfford !== option.canAfford) {
                        return {
                            ...option,
                            canAfford,
                        }
                    }

                    return option
                })
            }
            this.store.triggerUpdate()
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
        } else if (this.state.options.some(o => o.id === option)) {
            this.state = {
                ...this.state,
                selected: option,
            }
            this.store.triggerUpdate()
        }
    }
}
