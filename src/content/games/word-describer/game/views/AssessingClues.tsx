import { useState } from 'react'

import { useGameContext } from '../context'
import type { AssessingCluesOutputGiver } from '../types'
import { PlayerList } from '../components/PlayerList'
import { WordDisplay } from '../components/WordDisplay'
import { Hint } from '../components/Hint'
import { ReadyUp } from '../components/ReadyUp'

export const AssessingClues = () => {
    const { output, socket } = useGameContext()

    const [selected, setSelected] = useState<'fine' | 'illegal' | 'duplicate'>('fine')

    if (output.state.state !== 'assessing-clues') {
        return null
    }

    const clues = output.state.clues

    if (clues.length === 0) {
        return null
    }

    if ('word' in clues[0]) {
        const state = output.state as AssessingCluesOutputGiver

        return (
            <div id="assessing">
                <PlayerList />
                <div className="center">
                    <WordDisplay theWord={state.secretWord} />
                    <Hint>
                        <div>
                            Now you need to check the clues and mark ALL words which appear more than once as duplicates.
                        </div>
                        <div>
                            Words that are "too similar" (e.g. "dog" and "dogs") should also be considered duplicates.
                        </div>
                        <div>
                            Any clue that is <i>illegal</i> should also be marked as such, e.g. the secret word or a word too close to it.
                        </div>
                    </Hint>
                    <ReadyUp />
                    <div className="assessing-options">
                        <button
                            className="assessing-option"
                            data-selected={selected === 'fine'}
                            data-option="fine"
                            onClick={() => setSelected('fine')}
                        >
                            <strong>Fine</strong>
                        </button>
                        <button
                            className="assessing-option"
                            data-selected={selected === 'duplicate'}
                            data-option="duplicate"
                            onClick={() => setSelected('duplicate')}
                        >
                            <strong>Duplicate</strong>
                        </button>
                        <button
                            className="assessing-option"
                            data-selected={selected === 'illegal'}
                            data-option="illegal"
                            onClick={() => setSelected('illegal')}
                        >
                            <strong>Illegal</strong>
                        </button>
                    </div>
                    <div className="card-grid">
                        {state.clues.map((clue, index) => (
                            <div
                                key={index}
                                className="clue-card"
                                data-disabled={clue.tags.length > 0}
                                onClick={() => {
                                    if (clue.word) {
                                        socket.emit('tagClue', { word: clue.word, tag: selected })
                                    }
                                }}
                            >
                                <span className="big-text">{clue.word}</span>
                                <span className="player-name">
                                    {output.players.find((player) => player.id === clue.sender)?.name ?? null}
                                </span>
                                {clue.tags.map((tag) => (
                                    <span key={tag} className="clue-tag">{tag === 'duplicate' ? 'DUPLICATE' : 'ILLEGAL'}</span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div id="others-assessing">
                <PlayerList />
                <div className="center">
                    <div>Other players are checking for duplicates.</div>
                    <div className="card-grid">
                        {clues.map((clue, index) => (
                            <div key={index} className="clue-card" data-disabled={clue.tags.length > 0} />
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}
