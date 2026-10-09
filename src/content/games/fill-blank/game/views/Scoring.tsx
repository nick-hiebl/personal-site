import { useState } from 'react'

import { PlayerList } from '../components/PlayerList'
import { useGameContext } from '../context'

import './Scoring.css'

export const Scoring = () => {
    const { output, socket } = useGameContext()
    const [order, setOrder] = useState<number[]>([])
    const [lastSubmitted, setLastSubmitted] = useState<number[]>([])

    if (output.state.state !== 'scoring') {
        return null
    }

    const options = output.state.options

    return (
        <div className="stack gap-8px">
            <PlayerList />
            <h2>{output.state.prompt.promptText}</h2>
            <div>
                <p>Rank the following options:</p>
                <label>{output.state.prompt.high}</label>
                <ol className="ranked-list">
                    {order.map((indexId, ranking) => {
                        const submission = options.find(option => option.id === indexId)

                        if (!submission) {
                            return null
                        }

                        return (
                            <li key={`ranked-${indexId}`}>
                                <button
                                    className="ranking-option"
                                    onClick={() => {
                                        setOrder(currentOrder => currentOrder.filter(v => v !== indexId))
                                    }}
                                >
                                    <span className="scoring-number">{ranking + 1}</span>
                                    {submission.submission}
                                </button>
                            </li>
                        )
                    })}
                </ol>
                <ul className="unranked-list">
                    {options
                        .filter(option => !order.includes(option.id))
                        .map(option => (
                            <li key={`unranked-${option.id}`}>
                                <button
                                    className="ranking-option unranked"
                                    onClick={() => {
                                        setOrder(currentOrder => (
                                            currentOrder.concat(option.id)
                                        ))
                                    }}
                                >
                                    <span className="scoring-number unranked">?</span>
                                    {option.submission}
                                </button>
                            </li>
                        ))}
                </ul>
                <label>{output.state.prompt.low}</label>
            </div>
            <div>
                <button
                    disabled={order.length < options.length || (lastSubmitted.length > 0 && lastSubmitted.every((v, index) => order[index] === v))}
                    onClick={() => {
                        if (order.length < options.length) {
                            return
                        }

                        socket.emit('rank', { submissionIds: order })
                        setLastSubmitted(order.slice())
                    }}
                >
                    Submit
                </button>
            </div>
            <pre>{JSON.stringify(output, null, 2)}</pre>
        </div>
    )
}
