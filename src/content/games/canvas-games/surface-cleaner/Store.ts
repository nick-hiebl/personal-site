import { createExternalStore, type ExternalStore } from '../core/external-store'

import type { SurfaceCleanerGame } from './game'
import { RobotSettings } from './settings/RobotSettings'
import { SiloSettings } from './settings/SiloSettings'

export type StoreType = {
    open: boolean
    upgrades: Upgrade[]
}

type Cost = number

type Tag = 'player' | 'silo' | 'robot'

type UpgradeCore = {
    id: string
    name: string
    steps: [Cost, number][]
    buy: (game: SurfaceCleanerGame, value: number) => void
}

type Upgrade = UpgradeCore & {
    available: boolean
    tag: Tag
    stage: number
    stages: number
}

const UPGRADES: { tag: Tag; upgrades: UpgradeCore[] }[] = [
    {
        tag: 'player',
        upgrades: [
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
        ],
    },
    {
        tag: 'silo',
        upgrades: [
            {
                id: 'silo-store-size',
                name: 'Capacity',
                steps: [[50, 125_000], [250, 150_000], [1_000, 200_000], [5_000, 300_000]],
                buy: (_, value) => {
                    SiloSettings.storeCap = value
                },
            },
            {
                id: 'silo-transfer-rate',
                name: 'Silo transfer from player',
                steps: [[100, 2.5], [500, 4], [3_000, 7.5]],
                buy: (_, value) => {
                    SiloSettings.transferRate = value
                },
            },
            {
                id: 'silo-sell-rate',
                name: 'Sell rate',
                steps: [[50, 0.12], [250, 0.15], [1_000, 0.2], [5_000, 0.33], [20_000, 0.5]],
                buy: (_, value) => {
                    SiloSettings.sellFraction = value
                },
            },
            {
                id: 'silo-payload-time',
                name: 'Payload time',
                steps: [[100, 2_500], [400, 2_000], [2_000, 1_750], [5_000, 1_500], [20_000, 1_200]],
                buy: (_, value) => {
                    SiloSettings.payloadTime = value
                },
            },
        ],
    },
    {
        tag: 'robot',
        upgrades: [
            {
                id: 'robot-radius',
                name: 'Size',
                steps: [[50, 9], [200, 10], [500, 11], [1_000, 12], [5_000, 13], [25_000, 14]],
                buy: (_, value) => {
                    RobotSettings.radius = value
                },
            },
            {
                id: 'robot-storage',
                name: 'Inventory size',
                steps: [[600, 22_500], [1_000, 25_000], [2_500, 30_000], [5_000, 50_000]],
                buy: (_, value) => {
                    RobotSettings.storeCap = value
                },
            },
            {
                id: 'robot-speed',
                name: 'Speed',
                steps: [[150, 175], [500, 200], [1_500, 250], [5_000, 300], [12_000, 400]],
                buy: (_, value) => {
                    RobotSettings.speed = value
                },
            },
            {
                id: 'robot-payload-time',
                name: 'Payload time',
                steps: [[300, 1_800], [800, 1_633], [1_800, 1_500], [3_000, 1_250], [6_500, 1_100], [10_000, 1_000]],
                buy: (_, value) => {
                    RobotSettings.payloadTime = value
                },
            },
        ],
    },
]

export class SurfaceCleanerStore {
    state: StoreType

    store: ExternalStore<StoreType>

    constructor() {
        this.store = createExternalStore(() => this.state)

        this.state = {
            upgrades: UPGRADES.flatMap(({ tag, upgrades }) => upgrades.map((upgrade) => ({
                ...upgrade,
                available: false,
                stage: 0,
                stages: upgrade.steps.length,
                tag,
            }))),
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
