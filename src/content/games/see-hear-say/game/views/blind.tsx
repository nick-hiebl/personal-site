import { useState } from 'react'

import { Indicator } from '../components/Indicator'
import { LightBulb } from '../components/LightBulb'
import { Wire } from '../components/Wire'
import { useGameContext } from '../context'
import type { Module, WireModule } from '../types'

import { DirectionPuzzleBlind } from './DirectionPuzzle'
import { MatchPuzzleBlind } from './MatchPuzzle'
import { SymbolPuzzleBlind } from './SymbolPuzzle'

export const BlindView = () => {
    const { output } = useGameContext()

    if (output.state.state !== 'blind') {
        return null
    }

    return (
        <section className="column gap-8px">
            <h2>You are blind!</h2>
            {output.state.data.map((puzzle, index) => (
                <BlindPuzzle puzzle={puzzle} key={index} />
            ))}
        </section>
    )
}

const BlindPuzzle = ({ puzzle }: { puzzle: Module['blind'] }) => {
    if (puzzle.id === 'wire') {
        return <WirePuzzle puzzle={puzzle} />
    } else if (puzzle.id === 'direction') {
        return <DirectionPuzzleBlind puzzle={puzzle} />
    } else if (puzzle.id === 'symbol') {
        return <SymbolPuzzleBlind puzzle={puzzle} />
    } else if (puzzle.id === 'match') {
        return <MatchPuzzleBlind puzzle={puzzle} />
    }

    return <span>Unknown puzzle type!</span>
}

const WirePuzzle = ({ puzzle }: { puzzle: WireModule['blind'] }) => {
    const { socket } = useGameContext()
    const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined)

    return (
        <div className="module row gap-8px">
            <div className="row gap-8px">
                {puzzle.wires.map((w, index) => (
                    <button
                        key={index}
                        disabled={puzzle.cut[index]}
                        onMouseOver={() => {
                            setHoveredIndex(index)
                        }}
                        onMouseLeave={() => {
                            setHoveredIndex(current => current === index ? undefined : current)
                        }}
                        onClick={() => {
                            socket.emit('cut', { index: puzzle.index, wireIndex: index })
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: puzzle.cut[index] ? 'default' : 'pointer'
                        }}
                    >
                        <Wire
                            color={w}
                            cut={puzzle.cut[index]}
                            isHovered={hoveredIndex === index}
                        />
                    </button>
                ))}
            </div>
            <div className="column-center gap-16px">
                <LightBulb color={puzzle.light} />
                <Indicator enabled={puzzle.complete} />
            </div>
        </div>
    )
}
