import { useRef, useState } from 'react'

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
                    {game && (
                        <>
                            <ShopPanel game={game} />
                            <BuildMenu game={game} />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

const TABS = ['player', 'robot', 'silo']
const TAB_NAMES: Record<string, string> = {
    player: 'Player',
    robot: 'Robot',
    silo: 'Silo',
}

const ShopPanel = ({ game }: { game: SurfaceCleanerGame }) => {
    const { open, upgrades } = useStore(game.store.store)
    const [tab, setTab] = useState(TABS[0])

    return (
        <div
            id="shop-interface"
            className="menu-interface"
            style={{
                right: open ? '8px' : '-400px',
            }}
        >
            <h2>Shop</h2>
            <div role="tablist" className="row gap-8px">
                {TABS.map((tabName) => (
                    <button
                        key={tabName}
                        className="shop-list-tab"
                        role="tab"
                        aria-selected={tab === tabName}
                        onClick={() => {
                            setTab(tabName)
                        }}
                    >
                        {TAB_NAMES[tabName] ?? 'unknown'}
                    </button>
                ))}
            </div>
            {TABS.map((tabName) => (
                <ul key={tabName} className="shop-list" hidden={tabName !== tab}>
                    {upgrades.filter((upgrade) => upgrade.tag === tab).map((upgrade) => (
                        <li key={upgrade.id} className="upgrade-list-item">
                            <button
                                className="shop-button"
                                disabled={!upgrade.available}
                                onClick={() => {
                                    game.store.buyUpgrade(upgrade.id, game)
                                }}
                            >
                                <span>
                                    {upgrade.name}: ${(upgrade.steps[upgrade.stage] ?? upgrade.steps[upgrade.steps.length - 1])[0]}
                                </span>
                                <UpgradeProgress stage={upgrade.stage} numStages={upgrade.stages} />
                            </button>
                        </li>
                    ))}
                </ul>
            ))}
        </div>
    )
}

const UpgradeProgress = ({ stage, numStages }: { stage: number; numStages: number }) => {
    return (
        <div className="upgrade-progress" aria-label={`${stage} of ${numStages} progress`}>
            {new Array(numStages).fill(false).map((_, index) => (
                <span
                    key={index}
                    className="upgrade-progress-item"
                    data-complete={index < stage}
                />
            ))}
        </div>
    )
}

const BuildMenu = ({ game }: { game: SurfaceCleanerGame }) => {
    const { open, options, selected } = useStore(game.buildMenu.store)

    return (
        <div
            id="build-menu-interface"
            className="menu-interface"
            style={{
                bottom: open ? '8px' : '-200px',
            }}
        >
            <div className="row-center gap-8px">
                Build menu <KeyboardControl button="B" />
            </div>
            <ul className="build-menu-list">
                {options.map((option) => (
                    <li key={option.id}>
                        <button
                            className="build-menu-list-item"
                            data-selected={selected === option.id}
                            onClick={() => {
                                if (option.id === selected) {
                                    game.buildMenu.select(undefined)
                                } else {
                                    game.buildMenu.select(option.id)
                                }
                            }}
                            disabled={!option.canAfford}
                        >
                            <span>{option.id}</span>
                            <span>${option.cost.toFixed(2)}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

const KeyboardControl = ({ button }: { button: string }) => {
    return <span className="keyboard-control">{button}</span>
}
