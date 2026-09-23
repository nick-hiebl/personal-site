import { useEffect, useRef, useState } from 'react'

import { DirectionalArrow } from '../components/DirectionalArrow'
import { SymbolComponent } from '../components/Symbols'
import { useGameContext } from '../context'
import type { BaseColor, Direction, Symbol, SymbolModule } from '../types'

import { DirectionPhase } from './DirectionPuzzle'

import './symbol-puzzle.css'

export const SymbolPuzzleBlind = ({ puzzle }: { puzzle: SymbolModule['blind'] }) => {
    const [direction, setDirection] = useState(puzzle.direction ?? 'up')
    const { socket } = useGameContext()

    const onDirectionChange = (newDirection: Direction) => {
        socket.emit('symbols-direction', { index: puzzle.index, direction: newDirection })
        setDirection(newDirection)
    }

    return (
        <div className="module">
            <div className="row-center gap-16px">
                <DirectionPhase phase={puzzle.phase} />
                <SymbolPuzzleWheel
                    symbols={puzzle.symbols}
                    noiseSymbol={puzzle.noiseSymbol}
                    direction={direction}
                    onDirectionChange={onDirectionChange}
                />
                <div className="column-center gap-16px">
                    {puzzle.buttons.map((_, index) => (
                        <button
                            key={index}
                            className="symbol-button"
                            onClick={() => {
                                socket.emit('symbol-button', { index: puzzle.index, buttonIndex: index })
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export const SymbolPuzzleDeaf = ({ puzzle }: { puzzle: SymbolModule['deaf'] }) => {
    return (
        <div className="module">
            <div className="row-center gap-16px">
                <DirectionPhase phase={puzzle.phase} />
                <SymbolPuzzleWheel
                    symbols={puzzle.symbols}
                    direction={puzzle.direction}
                />
                <div className="column-center gap-16px">
                    {puzzle.buttons.map((color, index) => (
                        <button
                            key={index}
                            disabled
                            className="symbol-button deaf"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

const REFERENCE_SYMBOLS: Symbol[] = ['a', 'b', 'c', 'd']
const REFERENCE_BUTTONS: BaseColor[] = ['red', 'yellow', 'green']

export const SymbolPuzzleReference = () => {
    return (
        <div className="module">
            <div className="row-center gap-16px">
                <DirectionPhase phase={2} />
                <SymbolPuzzleWheel
                    symbols={REFERENCE_SYMBOLS}
                    direction="up"
                />
                <div className="column-center gap-16px">
                    {REFERENCE_BUTTONS.map((color, index) => (
                        <button
                            key={index}
                            disabled
                            className="symbol-button deaf"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

const AREAS: Direction[] = [
    'up',
    'right',
    'down',
    'left',
]

type WheelProps = {
    symbols: Symbol[]
    noiseSymbol?: Symbol
    direction: Direction
    onDirectionChange?: (newDirection: Direction) => void
}

const SymbolPuzzleWheel = ({ direction, noiseSymbol, symbols, onDirectionChange }: WheelProps) => {
    const [makingNoise, setMakingNoise] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!makingNoise) {
            return
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
            setMakingNoise(false)
        }, 1000)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [makingNoise])

    return (
        <div className="symbol-wheel">
            {symbols.map((symbol, index) => (
                <div key={symbol} className={`symbol-wheel-${AREAS[index]}`}>
                    <SymbolComponent symbol={symbol} />
                    {makingNoise && symbol === noiseSymbol && (
                        <span className="symbol-wheel-music anim">♪</span>
                    )}
                </div>
            ))}
            <div className="symbol-wheel-center">
                {onDirectionChange ? (
                    <button
                        onClick={() => {
                            const currentDirectionIndex = AREAS.findIndex(d => d === direction)

                            const nextDirectionIndex = (currentDirectionIndex + 1) % AREAS.length

                            if (noiseSymbol && symbols[nextDirectionIndex] === noiseSymbol) {
                                setMakingNoise(true)
                            }

                            onDirectionChange(AREAS[nextDirectionIndex] ?? 'up')
                        }}
                    >
                        <DirectionalArrow direction={direction} />
                    </button>
                ) : (
                    <DirectionalArrow direction={direction} />
                )}
            </div>
        </div>
    )
}
