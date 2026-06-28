import { useGameContext } from '../context'
import type { Racer } from '../types'

import './Board.css'

const COLORS: Record<Racer, string> = {
    red: 'red',
    yellow: 'yellow',
    green: 'green',
    blue: 'blue',
    purple: 'purple',
    black: '#333',
    white: '#ccc',
}

const TEXT_COLORS: Record<Racer, string> = {
    red: 'white',
    yellow: 'black',
    green: 'white',
    blue: 'white',
    purple: 'white',
    black: 'white',
    white: 'black',
}

export const Board = () => {
    const { output } = useGameContext()

    if (output.state.state === 'pending') {
        return null
    }

    return (
        <section>
            <div id="board" className="column gap-8px">
                <ul className="rolled-result-list full-width">
                    {output.state.rolledResults.map(result => {
                        if (result.type === 'crazy') {
                            return (
                                <li
                                    key={result.type}
                                    className="rolled-result"
                                    style={{
                                        backgroundColor: COLORS[result.actualRacer],
                                        color: TEXT_COLORS[result.actualRacer],
                                    }}
                                >
                                    {result.result}
                                </li>
                            )
                        }
                        return (
                            <li
                                key={result.type}
                                className="rolled-result"
                                style={{ backgroundColor: COLORS[result.type], color: TEXT_COLORS[result.type] }}
                            >
                                {result.result}
                            </li>
                        )
                    })}
                </ul>
                <ul id="board-list" className="full-width">
                    {output.state.board.map((cell, index) => (
                        <li key={index} className="board-cell">
                            <ul className="row gap-4px">
                                {cell.racers.map(color => (
                                    <li key={color}>
                                        <span
                                            className="racer"
                                            style={{ '--color': COLORS[color] } as React.CSSProperties}
                                        />
                                    </li>
                                ))}
                            </ul>
                            {index + 1}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
