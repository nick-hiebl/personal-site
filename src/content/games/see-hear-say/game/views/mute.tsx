import { ButtonIcon } from '../components/Button'
import { DirectionalArrow } from '../components/DirectionalArrow'
import { LightBulb } from '../components/LightBulb'
import { SymbolComponent } from '../components/Symbols'
import { WireSnip } from '../components/Wire'
import { useGameContext } from '../context'
import type {
    BaseColor,
    DirectionModule,
    DirectionModulePhase,
    Module,
    Symbol,
    SymbolModule,
    WireModule,
} from '../types'

import { ChartPuzzleRule } from './ChartPuzzle'
import { DirectionPhase, DirectionPuzzleReference } from './DirectionPuzzle'
import { MatchPuzzleRule } from './MatchPuzzle'
import { SymbolPuzzleReference } from './SymbolPuzzle'
import { WashingPuzzleRule } from './WashingPuzzle'

import './mute.css'

export const MuteView = () => {
    const { output } = useGameContext()

    if (output.state.state !== 'mute') {
        return null
    }

    return (
        <section className="column gap-8px">
            <h2>You are mute!</h2>
            <div className="column gap-16px">
                {Object.values(output.state.rules).map(rule => (
                    <Rule rule={rule} key={rule.id} />
                ))}
            </div>
        </section>
    )
}

const Rule = ({ rule }: { rule: Module['mute'] }) => {
    if (rule.id === 'wire') {
        return <WireRule rule={rule} />
    } else if (rule.id === 'direction') {
        return <DirectionRule rule={rule} />
    } else if (rule.id === 'symbol') {
        return <SymbolRule rule={rule} />
    } else if (rule.id === 'match') {
        return <MatchPuzzleRule rule={rule} />
    } else if (rule.id === 'chart') {
        return <ChartPuzzleRule rule={rule} />
    } else if (rule.id === 'washing') {
        return <WashingPuzzleRule rule={rule} />
    }

    return <span>Unknown puzzle type!</span>
}

const WireRule = ({ rule }: { rule: WireModule['mute'] }) => {
    // Re-parsing as number after transmission
    const rows = Object.keys(rule.rule).map(n => parseInt(n, 10))
    const keys = Object.keys(rule.rule[rows[0]]) as BaseColor[]

    return (
        <div className="rule-section">
            <h3>Wires</h3>
            <p>
                Determine which colour of wire to cut based on the number of wires
                present and the colour of the active light bulb.
            </p>
            <table className="info-table">
                <thead>
                    <tr>
                        <th />
                        {keys.map(key => (
                            <th key={key} className="head-cell no-text">
                                <LightBulb color={key} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row}>
                            <td className="row-label big-text">{row}x wire(s)</td>
                            {keys.map((key, index) => (
                                <td key={index} className="no-text">
                                    <WireSnip color={rule.rule[row][key]} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const DirectionRule = ({ rule }: { rule: DirectionModule['mute'] }) => {
    const rows = Object.keys(rule.rule).map(n => parseInt(n, 10))
    const keys = Object.keys(rule.rule[rows[0]]) as BaseColor[]

    return (
        <div className="rule-section column gap-16px">
            <h3>Directions</h3>
            <div>
                Determine which direction button to press based on the colour of the
                active light bulb and the number displayed in the center.
            </div>
            <div>
                The button in the center is displayed in <i>braille</i>.
            </div>
            <div>Puzzle looks as below:</div>
            <div>
                <DirectionPuzzleReference />
            </div>
            <table className="info-table">
                <thead>
                    <tr>
                        <th />
                        {keys.map(key => (
                            <th key={key} className="head-cell no-text">
                                <LightBulb color={key} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row}>
                            <td className="row-label big-text">{row}</td>
                            {keys.map((key, index) => (
                                <td key={index} className="no-text">
                                    <DirectionalArrow direction={rule.rule[row][key]} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const SymbolRule = ({ rule }: { rule: SymbolModule['mute'] }) => {
    const rows = Object.keys(rule.rule) as Symbol[]
    const keys = [0, 1, 2, 3]

    return (
        <div className="rule-section column gap-16px">
            <h3>Symbol</h3>
            <div>
                Rotate the pointer to find the symbol that makes a sound.
            </div>
            <div>Indicator lights on the left show progress through the 4 stages.</div>
            <div>Find the correct button colour to press based on the current stage, and the symbol which makes a noise.</div>
            <div>
                Puzzle looks as below:
            </div>
            <div>
                <SymbolPuzzleReference />
            </div>
            <table className="info-table">
                <thead>
                    <tr>
                        <th />
                        {keys.map(key => (
                            <th key={key} className="head-cell">
                                <DirectionPhase phase={key as DirectionModulePhase} size="25" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((symbol) => (
                        <tr key={symbol}>
                            <td className="row-label big-text">
                                <SymbolComponent symbol={symbol} />
                            </td>
                            {keys.map((key, index) => (
                                <td key={index} className="no-text">
                                    <ButtonIcon color={rule.rule[symbol][key]} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
