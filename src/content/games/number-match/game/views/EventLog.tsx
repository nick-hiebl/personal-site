import { Coord } from '../components/Coord'
import { useGameContext } from '../context'
import type { Coordinate, OutputGridOption, Tag, ValueDetails } from '../types'

import './EventLog.css'

const tagToText = (tag: Tag | { type: 'red' }): string => {
    return tag.type === 'value' ? tag.value.toString() : tag.type
}

const isGuessCorrect = (tag: Tag, coordinate: Coordinate, grid: OutputGridOption | undefined, valueDetails: ValueDetails[]) => {
    if (!grid) {
        return false
    }

    const cell = grid.values[coordinate.row][coordinate.column]

    return tag.type === 'value'
        ? cell.value === tag.value
        : valueDetails.find(v => v.value === cell.value)?.isYellow ?? false
}

export const EventLog = () => {
    const { output } = useGameContext()

    const state = output.state

    if (state.state === 'pending') {
        return null
    }

    const log = output.eventLog.slice()
    log.reverse()

    return (
        <div>
            <br />
            <h4>Event log</h4>
            <ul className="event-log">
                {log.map((item, index) => {
                    const player = output.players.find(p => p.id === item.user)
                    const playerName = player?.name ?? 'Someone'

                    if (item.type === 'guess') {
                        const targetGrid = state.grids.find(g => g.id === item.targetCell.gridId)

                        const isCorrect = isGuessCorrect(item.value, item.targetCell, targetGrid, state.valueDetails)

                        return (
                            <li key={index}>
                                {playerName} guessed {tagToText(item.value)} in <Coord coordinate={item.targetCell} />
                                {' '}
                                {isCorrect ? '✅' : '❌'}
                            </li>
                        )
                    } else if (item.type === 'tag') {
                        return (
                            <li key={index}>
                                {playerName} tagged <Coord coordinate={item.cell} />
                            </li>
                        )
                    } else if (item.type === 'reveal-all') {
                        return (
                            <li key={index}>
                                {playerName} revealed all instances of {tagToText(item.value)}
                            </li>
                        )
                    }

                    return (
                        <li key={index}>
                            <pre>{JSON.stringify(item, null, 2)}</pre>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
