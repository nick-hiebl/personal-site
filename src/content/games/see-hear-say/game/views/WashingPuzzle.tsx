import { DirectionalArrow } from '../components/DirectionalArrow'
import { Indicator } from '../components/Indicator'
import { WashingSymbol, type WashSymbol } from '../components/WashingSymbol'
import { useGameContext } from '../context'
import type { WashingItem, WashingModule } from '../types'

import './washing-module.css'

export const WashingPuzzleBlind = ({ puzzle }: { puzzle: WashingModule['blind']}) => {
    const { socket } = useGameContext()

    return (
        <div className="module column-center gap-16px">
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace" />
                </div>
                <Indicator enabled={puzzle.complete} />
            </div>
            <div className="row-center gap-16px spread full-width">
                <button
                    onClick={() => {
                        socket.emit('washing-step', {
                            index: puzzle.index,
                            direction: 'left',
                        })
                    }}
                >
                    <DirectionalArrow direction="left" />
                </button>
                <button
                    className="chart-big-button"
                    onClick={() => {
                        socket.emit('washing-submit', {
                            index: puzzle.index,
                        })
                    }}
                >
                    LAUNDER
                </button>
                <button
                    onClick={() => {
                        socket.emit('washing-step', {
                            index: puzzle.index,
                            direction: 'right',
                        })
                    }}
                >
                    <DirectionalArrow direction="right" />
                </button>
            </div>
            <div className="washing-grid">
                <Dial
                    onClick={() => {
                        socket.emit('washing-dial', { index: puzzle.index, dial: 'temperature' })
                    }}
                    direction={puzzle.temperature}
                />
                <Dial
                    onClick={() => {
                        socket.emit('washing-dial', { index: puzzle.index, dial: 'dry' })
                    }}
                    direction={puzzle.drying}
                />
                <Dial
                    onClick={() => {
                        socket.emit('washing-dial', { index: puzzle.index, dial: 'iron' })
                    }}
                    direction={puzzle.iron}
                />
                {puzzle.specialLabel && (
                    <button
                        className="chart-button"
                        onClick={() => {
                            socket.emit('washing-special', { index: puzzle.index })
                        }}
                    >
                        <span className="chart-button-primary">
                            <WashingSymbol symbol={puzzle.specialLabel} />
                        </span>
                        <span className="chart-button-indicator" data-enabled={puzzle.special} />
                    </button>
                )}
            </div>
        </div>
    )
}

export const WashingPuzzleDeaf = ({ puzzle }: { puzzle: WashingModule['deaf']}) => {
    return (
        <div className="module column-center gap-16px">
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace">
                        {puzzle.currentItem}
                    </div>
                </div>
                <Indicator enabled={puzzle.complete} />
            </div>
            <div className="row-center gap-16px spread full-width">
                <button disabled>
                    <DirectionalArrow direction="left" />
                </button>
                <button className="chart-big-button" disabled>
                    LAUNDER
                </button>
                <button disabled>
                    <DirectionalArrow direction="right" />
                </button>
            </div>
            <div className="washing-grid">
                <Dial direction={puzzle.temperature} symbols={puzzle.tempLabels} />
                <Dial direction={puzzle.drying} symbols={puzzle.dryingLabels} />
                <Dial direction={puzzle.iron} symbols={puzzle.ironLabels} />
                <button className="chart-button" disabled>
                    <span className="chart-button-primary">
                        <WashingSymbol symbol="blank" />
                    </span>
                    <span className="chart-button-indicator" data-enabled={puzzle.special} />
                </button>
            </div>
        </div>
    )
}

type DialProps = {
    onClick?: () => void
    direction: 0 | 1 | 2
    symbols?: WashSymbol[]
}

const Dial = ({ direction, symbols, onClick }: DialProps) => {
    const dial = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 40 40"
            width="40"
            className={`washing-dial-arrow washing-dial-arrow-${direction}`}
        >
            <circle cx="20" cy="20" r="20" fill="rgb(107, 107, 107)" />
            <circle cx="20" cy="20" r="10" fill="white" />
            <path
                d="M 20 1 L 12 20 L 28 20"
                strokeLinecap="round"
                fill="white"
            />
        </svg>
    )
    return (
        <div className="no-text row-center gap-8px">
            <div className="column">
                <WashingSymbol symbol={symbols?.[0] ?? 'blank'} />
            </div>
            <div className="column-center gap-8px">
                <WashingSymbol symbol={symbols?.[1] ?? 'blank'} />
                {onClick ? (
                    <button className="washing-dial-button no-text" onClick={onClick}>
                        {dial}
                    </button>
                ) : dial}
            </div>
            <div className="column">
                <WashingSymbol symbol={symbols?.[2] ?? 'blank'} />
            </div>
        </div>
    )
}

type Detail = [WashSymbol, string]

const WASHING_SYMBOL_DETAILS: { title: string, details: Detail[] }[] = [
    {
        title: 'Temperature',
        details: [
            ['dot-1', '30°C'],
            ['dot-2', '40°C'],
            ['dot-3', '50°C'],
            ['dot-4', '60°C'],
            ['dot-5', '70°C'],
            ['dot-6', '95°C'],
        ],
    },
    {
        title: 'Drying',
        details: [
            ['tumble', 'Tumble dry'],
            ['shade', 'Dry in the shade'],
            ['flat', 'Dry flat'],
            ['drip', 'Drip dry'],
            ['hang', 'Hang to dry'],
        ],
    },
    {
        title: 'Ironing',
        details: [
            ['no', 'Do not iron'],
            ['low', 'Low heat iron'],
            ['medium', 'Medium heat iron'],
            ['high', 'High heat iron'],
        ],
    },
    {
        title: 'Special',
        details: [
            ['dry-clean', 'Dry clean'],
            ['non-chlorine-bleach', 'Non chlorine bleach'],
        ],
    },
]

export const WashingPuzzleRule = ({ rule }: { rule: WashingModule['mute'] }) => {
    const items = Object.keys(rule.requirements) as WashingItem[]

    return (
        <div className="rule-section column gap-16px">
            <h3>Washing</h3>
            <div>
                Examine the three washing items available, and determine which is able to be
                suitably laundered with the options available.
            </div>
            <div>Puzzle looks as below:</div>
            <div>...</div>
            <table className="info-table">
                <thead>
                    <tr>
                        <th className="head-cell">Item</th>
                        <th className="head-cell">Temperature</th>
                        <th className="head-cell">Drying</th>
                        <th className="head-cell">Ironing</th>
                        <th className="head-cell">Special</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item}>
                            <td className="row-label">{item}</td>
                            <td>
                                {rule.requirements[item].temperature.min}°C
                                {' - '}
                                {rule.requirements[item].temperature.max}°C
                            </td>
                            <td className="no-text">
                                <WashingSymbol symbol={rule.requirements[item].drying} background />
                            </td>
                            <td className="no-text">
                                <WashingSymbol symbol={rule.requirements[item].iron} background />
                            </td>
                            <td className="no-text">
                                {rule.requirements[item].special ? (
                                    <WashingSymbol symbol={rule.requirements[item].special} background />
                                ) : null}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="column gap-16px">
                {WASHING_SYMBOL_DETAILS.map(({ title, details }) => (
                    <div key={title} className="column gap-8px">
                        <h4>{title}</h4>
                        <div className="washing-detail-grid">
                            {details.map(([symbol, text]) => (
                                <div key={symbol} className="column-center gap-4px">
                                    <WashingSymbol symbol={symbol} background />
                                    <span className="washing-symbol-explanation">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
