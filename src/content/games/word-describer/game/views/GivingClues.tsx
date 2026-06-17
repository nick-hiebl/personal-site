import { useEffect, useState } from 'react'

import { Hint } from '../components/Hint'
import { MoveOn } from '../components/MoveOn'
import { PlayerList } from '../components/PlayerList'
import { WordDisplay } from '../components/WordDisplay'
import { useGameContext } from '../context'
import type { Clue, GivingCluesOutput, GivingCluesOutputGiver, GivingCluesOutputReceiver } from '../types'
import { idOfGuesser } from '../utils'

export const GivingClues = () => {
    const { isReadOnly, output, socket } = useGameContext()

    const numClues = output.state.state === 'giving-clues' ? output.state.cluesPerPlayer : 0

    const [clueBox, setClueBox] = useState<string[]>(() => {
        if (output.state.state === 'giving-clues') {
            if (output.state.guesserId !== output.yourId) {
                const state = output.state as GivingCluesOutputGiver

                const myClues = state.clues.filter((clue) => clue.sender === output.yourId)

                return myClues.map((clue) => 'word' in clue ? clue.word : '')
                    .concat(new Array(numClues - myClues.length).fill(''))
            }
        }

        return []
    })

    useEffect(() => {
        setClueBox((current) => {
            if (current.length !== numClues) {
                return new Array(numClues).fill('')
            }

            return current
        })
    }, [numClues])

    if (output.state.state !== 'giving-clues') {
        return null
    }

    const getUserNodes = (state: GivingCluesOutput) => (playerId: string) => {
        if (playerId === idOfGuesser(output)) {
            return []
        }

        return [
            <span key="clues">{state.clues.filter((clue) => clue.sender === playerId).length} / {state.cluesPerPlayer}</span>
        ]
    }

    if (output.state.guesserId === output.yourId || isReadOnly) {
        const state = output.state as GivingCluesOutputReceiver

        const relevantPlayers = output.players.filter(p => p.status !== 'waiting')

        return (
            <div id="others-giving-clues">
                <PlayerList extraContent={getUserNodes(state)} />
                <div className="center">
                    <div>Clues given:</div>
                    <div className="big-text">
                        {state.clues.length} / {state.cluesPerPlayer * (relevantPlayers.length - 1)}
                    </div>
                </div>
            </div>
        )
    }

    const state = output.state as GivingCluesOutputGiver

    const myClues = state.clues.filter((clue) => clue.sender === output.yourId) as Clue[]

    const everyoneReady = output.players.every(
        player => player.id === state.guesserId ||
            player.status === 'waiting' ||
            state.clues.filter((clue) => clue.sender === player.id).length >= state.cluesPerPlayer
    )

    return (
        <div id="clue-giving">
            <PlayerList extraContent={getUserNodes(state)} />
            <div className="center">
                <WordDisplay theWord={state.secretWord} />
                <Hint>
                    <div>
                        Give a <i>one-word hint</i> that will help the guesser guess the word above.
                    </div>
                    <div>
                        However, try not to give the same hint as anyone else!
                    </div>
                </Hint>
                <form className="center" onSubmit={formEvent => {
                    formEvent.preventDefault()

                    const formData = new FormData(formEvent.currentTarget)

                    const clues = new Array(numClues).fill('').map((_, index) => {
                        return formData.get(`clue-${index}`)
                    })

                    socket.emit('submitClues', { clues: clues })
                }}>
                    {state.cluesPerPlayer === 1 ? 'Your clue is:' : 'Your clues are:'}
                    <div className="input-boxes">
                        {clueBox.map((value, index) => {
                            return (
                                <div className="input-box" key={index}>
                                    <input
                                        type="text"
                                        value={value}
                                        autoCapitalize="off"
                                        autoComplete="off"
                                        id={`clue-${index}`}
                                        name={`clue-${index}`}
                                        onChange={(e) => {
                                            const val = e.currentTarget.value
                                            setClueBox((current) => {
                                                return current
                                                    .map((item, innerIndex) => index === innerIndex ? val : item)
                                            })
                                        }}
                                    />
                                    {myClues.some((clue) => clue.word === clueBox[index]) ? '✅' : '❌'}
                                </div>
                            )
                        })}
                        <button type="submit" className="clue-button">
                            Send clues
                        </button>
                    </div>
                </form>
                {myClues.length === numClues && (
                    <MoveOn title="Ready" subtitle={everyoneReady ? 'Waiting for others to be ready' : 'Waiting for others to submit words'} />
                )}
            </div>
        </div>
    )
}
