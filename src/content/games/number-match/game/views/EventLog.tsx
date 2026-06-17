import { Coord } from '../components/Coord'
import { useGameContext } from '../context'

import './EventLog.css'

export const EventLog = () => {
    const { output } = useGameContext()

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
                        return (
                            <li key={index}>
                                {playerName} guessed <Coord coordinate={item.targetCell} />
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
                                {playerName} revealed all instances of {item.value.type === 'value' ? item.value.value : item.value.type}
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
