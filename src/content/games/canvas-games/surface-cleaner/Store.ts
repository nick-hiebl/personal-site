import { createExternalStore, type ExternalStore } from '../core/external-store'

import type { SurfaceCleanerGame } from './game'

export type StoreType = {
    open: boolean
    upgrades: Upgrade[]
}

type Cost = number

type UpgradeCore = {
    id: string
    name: string
    steps: [Cost, number][]
    buy: (game: SurfaceCleanerGame, value: number) => void
}

type Upgrade = UpgradeCore & {
    available: boolean
    stage: number
    stages: number
}

const ALL_UPGRADES: UpgradeCore[] = [
    {
        id: 'big-radius',
        name: 'Big radius',
        steps: [[10, 14], [50, 16], [100, 18], [150, 20], [250, 22], [400, 24], [400, 26], [1000, 28], [3000, 30]],
        buy: (game, value) => {
            game.players.forEach((player) => { player.radius = value })
        },
    },
    {
        id: 'more-space',
        name: 'More storage',
        steps: [[20, 25_000], [50, 50_000], [100, 100_000], [250, 150_000], [500, 200_000], [1000, 300_000]],
        buy: (game, value) => {
            game.players.forEach((player) => { player.storeCap = value })
        },
    },
    {
        id: 'sell-speed',
        name: 'Sell speed',
        steps: [[40, 5], [100, 15], [300, 30], [500, 70], [2000, 120], [5000, 250], [20_000, 1000]],
        buy: (game, value) => {
            game.sellRate = value
        },
    },
    {
        id: 'move-speed',
        name: 'Move speed',
        steps: [[50, 0.15], [100, 0.2], [250, 0.25], [1000, 0.32]],
        buy: (game, value) => {
            game.players.forEach((player) => { player.speed = value })
        },
    },
    {
        id: 'conversation-rate',
        name: 'Efficient refinement',
        steps: [[100, 1.1], [2000, 1.2], [25_000, 1.3]],
        buy: (game, value) => {
            game.conversionRate = value
        },
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
                stages: upgrade.steps.length,
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

    onUpdateMoney(money: number): boolean {
        let upgradesDirty = false

        this.state.upgrades.forEach((upgrade) => {
            const canAfford = upgrade.stage < upgrade.steps.length && upgrade.steps[upgrade.stage][0] <= money && upgrade.stage < upgrade.stages

            if (canAfford !== upgrade.available) {
                upgradesDirty = true
            }
        })

        if (upgradesDirty) {
            this.state = {
                ...this.state,
                upgrades: this.state.upgrades.map((upgrade) => {
                    const canAfford = upgrade.stage < upgrade.steps.length && upgrade.steps[upgrade.stage][0] <= money && upgrade.stage < upgrade.stages
    
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

        game.money -= upgrade.steps[upgrade.stage][0]
        upgrade.buy(game, upgrade.steps[upgrade.stage][1])
        upgrade.stage += 1

        const updated = this.onUpdateMoney(game.money)

        if (!updated) {
            this.state = {
                ...this.state,
                upgrades: this.state.upgrades.slice(),
            }

            this.store.triggerUpdate()
        }
    }
}
