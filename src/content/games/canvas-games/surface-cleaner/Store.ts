import { createExternalStore, type ExternalStore } from '../core/external-store'

import type { SurfaceCleanerGame } from './game'

export type StoreType = {
    open: boolean
    upgrades: Upgrade[]
}

type UpgradeCore = {
    id: string
    name: string
    costs: number[]
    buy: (game: SurfaceCleanerGame, stage: number) => void
    stages: number
}

type Upgrade = UpgradeCore & {
    available: boolean
    stage: number
}

const ALL_UPGRADES: UpgradeCore[] = [
    {
        id: 'big-radius',
        name: 'Big radius',
        costs: [1, 2, 3],
        buy: (game, index) => {
            game.players.forEach((player) => { player.radius = [20, 50, 90][index] })
        },
        stages: 3,
    },
    {
        id: 'more-space',
        name: 'More storage',
        costs: [2, 4],
        buy: (game, index) => {
            game.players.forEach((player) => { player.storeCap = [30_000, 50_000][index] })
        },
        stages: 2,
    },
]

export class SurfaceCleanerStore {
    state: StoreType

    store: ExternalStore<StoreType>

    constructor() {
        this.store = createExternalStore(() => this.state)

        this.state = {
            upgrades: ALL_UPGRADES.map((upgrade) => ({
                ...upgrade,
                available: false,
                stage: 0,
            })),
            open: false,
        }
    }

    setOpen(open: boolean) {
        if (this.state.open === open) {
            return
        }

        this.state = {
            ...this.state,
            open,
        }
        this.store.triggerUpdate()
    }

    onUpdateMoney(game: SurfaceCleanerGame): boolean {
        const money = game.money

        let upgradesDirty = false

        this.state.upgrades.forEach((upgrade) => {
            const canAfford = upgrade.costs[upgrade.stage] <= money && upgrade.stage < upgrade.stages

            if (canAfford !== upgrade.available) {
                upgradesDirty = true
            }
        })

        if (upgradesDirty) {
            this.state = {
                ...this.state,
                upgrades: this.state.upgrades.map((upgrade) => {
                    const canAfford = upgrade.costs[upgrade.stage] <= money && upgrade.stage < upgrade.stages
    
                    if (canAfford !== upgrade.available) {
                        return {
                            ...upgrade,
                            available: canAfford,
                        }
                    }
    
                    return upgrade
                })
            }

            this.store.triggerUpdate()
        }

        return upgradesDirty
    }

    buyUpgrade(id: string, game: SurfaceCleanerGame) {
        const upgrade = this.state.upgrades.find((upgrade) => upgrade.id === id)

        if (!upgrade || !upgrade.available || upgrade.stage >= upgrade.stages) {
            return
        }

        game.money -= upgrade.costs[upgrade.stage]
        upgrade.buy(game, upgrade.stage)
        upgrade.stage += 1

        const updated = this.onUpdateMoney(game)

        if (!updated) {
            this.state = {
                ...this.state,
                upgrades: this.state.upgrades.slice(),
            }

            this.store.triggerUpdate()
        }
    }
}
