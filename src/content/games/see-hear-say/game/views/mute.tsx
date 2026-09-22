import { DirectionalArrow } from '../components/DirectionalArrow'
import { LightBulb } from '../components/LightBulb'
import { WireSnip } from '../components/Wire'
import { useGameContext } from '../context'
import type { BaseColor, DirectionModule, Module, WireModule } from '../types'

import { DirectionPuzzleReference } from './DirectionPuzzle'

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
                Determine which wire to cut based on the number of wires
                present and the colour of the active light bulb.
            </p>
            <table className="info-table">
                <thead>
                    <tr>
                        <th />
                        {keys.map(key => (
                            <th key={key} className="head-cell">
                                <LightBulb color={key} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row}>
                            <td>{row}</td>
                            {keys.map((key, index) => (
                                <td key={index}>
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
                Determine which direction to press based on the colour of the
                active light bulb and the number displayed in the center.
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
                            <th key={key} className="head-cell">
                                <LightBulb color={key} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row}>
                            <td>{row}</td>
                            {keys.map((key, index) => (
                                <td key={index}>
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
