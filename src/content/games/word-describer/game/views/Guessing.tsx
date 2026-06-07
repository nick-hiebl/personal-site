import { PlayerList } from '../components/PlayerList'
import { WordDisplay } from '../components/WordDisplay'
import { useGameContext } from '../context'
import type { Clue, GuessingOutput } from '../types'

export const Guessing = () => {
    const { output, socket } = useGameContext()

    if (output.state.state !== 'guessing') {
        return null
    }

    const state2: GuessingOutput = output.state

    if (state2.guesserId === output.yourId) {
        const clues = state2.clues.map((clue) => clue.word)

        return (
            <div id="your-guessing-spot">
                <PlayerList />
                <div className="center">
                    <form onSubmit={formEvent => {
                        formEvent.preventDefault()

                        const formData = new FormData(formEvent.currentTarget)

                        const guess = formData.get('guess')

                        if (guess && typeof guess === 'string') {
                            socket.emit('guess', { guess })
                        }
                    }}>
                        <div className="gap-line">
                            <label htmlFor="guess">Guess:</label>
                            <input type="text" id="guess" name="guess" autoCapitalize="off" autoComplete="off" />
                            <button type="submit">Submit guess</button>
                        </div>
                    </form>
                    <div>Clues:</div>
                    <div className="card-grid">
                        {clues.map((clue, index) => (
                            <div className="clue-card" key={index}>
                                <span className="big-text">{clue}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    } else {
        const clues = state2.clues as Clue[]
        const shownClues = clues.filter((clue) => clue.tags.length === 0)
        const hiddenClues = clues.filter((clue) => clue.tags.length > 0)
        return (
            <div id="guessing-time">
                <PlayerList />
                <div className="center">
                    {'secretWord' in state2 && (
                        <WordDisplay theWord={state2.secretWord} />
                    )}
                    {shownClues && (
                        <>
                            <div>Visible clues:</div>
                            <div className="card-grid">
                                {shownClues.map((clue, index) => (
                                    <div className="clue-card" key={index}>
                                        <span className="big-text">{clue.word}</span>
                                        <span className="player-name">
                                            {output.players.find((player) => player.id === clue.sender)?.name ?? null}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {hiddenClues.length > 0 && (
                        <>
                            <div>Hidden clues:</div>
                            <div className="card-grid">
                                {hiddenClues.map((clue, index) => (
                                    <div className="clue-card" key={index} data-disabled={true}>
                                        <span className="big-text">{clue.word}</span>
                                        <span>{output.players.find((player) => player.id === clue.sender)?.name ?? null}</span>
                                        {clue.tags.map((tag) => (
                                            <span key={tag} className="clue-tag">{tag === 'duplicate' ? 'DUPLICATE' : 'ILLEGAL'}</span>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }
}
