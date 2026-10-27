import { useRef, useState, useSyncExternalStore } from 'react'

import { useStore } from '../core/external-store'

import { SurfaceCleanerGame } from './game'

import './style.css'

export const Game = () => {
    const gameRef = useRef<SurfaceCleanerGame>(null)
    const [game, setGame] = useState<SurfaceCleanerGame | undefined>()

    return (
        <div className="column gap-16px">
            <h1>Surface cleaner</h1>
            <div className="column-center">
                <div id="main-container">
                    <canvas
                        style={{ width: '1440px' }}
                        width="1440"
                        height="810"
                        ref={(canvas) => {
                            if (!canvas || gameRef.current) {
                                return
                            }

                            gameRef.current = new SurfaceCleanerGame(canvas)
                            gameRef.current.start()
                            setGame(gameRef.current)
                        }}
                    />
                    {game && <ShopPanel game={game} />}
                </div>
            </div>
        </div>
    )
}

const ShopPanel = ({ game }: { game: SurfaceCleanerGame }) => {
    const { open, upgrades } = useStore(game.store.store)

    console.log('Store updated')

    return (
        <div
            id="shop-interface"
            style={{
                right: open ? '8px' : '-400px',
            }}
        >
            <h2>Shop</h2>
            <ul className="shop-list">
                {upgrades.map((upgrade) => (
                    <li key={upgrade.id} className="upgrade-list-item">
                        <button
                            className="shop-button"
                            disabled={!upgrade.available}
                            onClick={() => {
                                game.store.buyUpgrade(upgrade.id, game)
                            }}
                        >
                            <span>
                                {upgrade.name}: ${upgrade.costs[upgrade.stage] ?? upgrade.costs[upgrade.stages - 1]}
                            </span>
                            <UpgradeProgress stage={upgrade.stage} numStages={upgrade.stages} />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

const UpgradeProgress = ({ stage, numStages }: { stage: number; numStages: number }) => {
    return (
        <div className="upgrade-progress" aria-label={`${stage} of ${numStages} progress`}>
            {new Array(numStages).fill(false).map((_, index) => (
                <span className="upgrade-progress-item" data-complete={index < stage} />
            ))}
        </div>
    )
}
