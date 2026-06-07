import { useGameContext } from '../context'
import type { Clue } from '../types'

import './ResultsTable.css'

interface Props {
    theWord: string
    guess: string

    clues: Clue[]
}

export const ResultsTable = ({ clues, guess, theWord }: Props) => {
    const { output } = useGameContext()

    return (
        <div className="center">
            <div className="post-answers">
                <div>
                    <div>Word:</div>
                    <div className="big-text">{theWord}</div>
                </div>
                <div>
                    <div>Guess:</div>
                    <div className="big-text">{guess}</div>
                </div>
            </div>
            <table className="post-game-clues">
                <thead>
                    <tr>
                        <th>Clue</th>
                        <th>Sender</th>
                    </tr>
                </thead>
                <tbody>
                    {clues.map((clue, index) => (
                        <tr key={index}>
                            <td>{clue.word}</td>
                            <td>
                                {output.players.find((player) => player.id === clue.sender)?.name ?? 'Unknown'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
