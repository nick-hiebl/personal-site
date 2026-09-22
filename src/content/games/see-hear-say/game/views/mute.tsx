import { LightBulb } from '../components/LightBulb'
import { WireSnip } from '../components/Wire'
import { useGameContext } from '../context'
import type { BaseColor, Module, WireModule } from '../types'

import './mute.css'

export const MuteView = () => {
    const { output } = useGameContext()

    if (output.state.state !== 'mute') {
        return null
    }

    return (
        <section className="column gap-8px">
            <h2>You are mute!</h2>
            {Object.values(output.state.rules).map(rule => (
                <Rule rule={rule} key={rule.id} />
            ))}
        </section>
    )
}

const Rule = ({ rule }: { rule: Module['mute'] }) => {
    if (rule.id === 'wire') {
        return <WireRule rule={rule} />
    }

    return <span>Unknown puzzle type!</span>
}

const WireRule = ({ rule }: { rule: WireModule['mute'] }) => {
    // Re-parsing as number after transmission
    const rows = Object.keys(rule.rule).map(n => parseInt(n, 10)) as number[]
    const keys = Object.keys(rule.rule[rows[0]]) as BaseColor[]

    return (
        <table className="info-table">
            <thead>
                <tr>
                    <th></th>
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
    )
}
