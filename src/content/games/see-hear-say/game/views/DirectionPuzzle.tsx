import { BrailleDigit } from '../components/Braille'
import { DirectionalArrow } from '../components/DirectionalArrow'
import { Indicator } from '../components/Indicator'
import { LightBulb } from '../components/LightBulb'
import { useGameContext } from '../context'
import type { Direction, DirectionModule, DirectionModulePhase } from '../types'

import './direction-puzzle.css'

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right']

export const DirectionPuzzleReference = () => {
    return (
        <div className="module">
            <div className="direction-puzzle">
                {DIRECTIONS.map((direction) => (
                    <div className={`direction-${direction}`} key={direction}>
                        <DirectionalArrow direction={direction} />
                    </div>
                ))}
                <div className="direction-center">
                    <BrailleDigit digit={8} />
                </div>
                <div className="direction-light">
                    <LightBulb color="green" />
                </div>
                <div className="direction-phase">
                    <DirectionPhase phase={2} />
                </div>
            </div>
        </div>
    )
}

export const DirectionPuzzleBlind = ({ puzzle }: { puzzle: DirectionModule['blind'] }) => {
    const { socket } = useGameContext()

    return (
        <div className="module">
            <div className="direction-puzzle">
                {DIRECTIONS.map((direction) => (
                    <div className={`direction-${direction}`} key={direction}>
                        <button
                            onClick={() => {
                                socket.emit('direction', { index: puzzle.index, direction })
                            }}
                        >
                            <DirectionalArrow direction={direction} />
                        </button>
                    </div>
                ))}
                <div className="direction-center blind">
                    {puzzle.digit}
                </div>
                <div className="direction-light">
                    <LightBulb color={puzzle.light} />
                </div>
                <div className="direction-phase">
                    <DirectionPhase phase={puzzle.phase} />
                </div>
            </div>
        </div>
    )
}

export const DirectionPuzzleDeaf = ({ puzzle }: { puzzle: DirectionModule['deaf'] }) => {
    return (
        <div className="module">
            <div className="direction-puzzle">
                {DIRECTIONS.map((direction) => (
                    <div
                        className={`direction-${direction}`}
                        key={direction}
                        style={{ cursor: 'not-allowed' }}
                    >
                        <DirectionalArrow direction={direction} />
                    </div>
                ))}
                <div className="direction-center">
                    <BrailleDigit digit={puzzle.digit} />
                </div>
                <div className="direction-light">
                    <LightBulb color={puzzle.light} />
                </div>
                <div className="direction-phase">
                    <DirectionPhase phase={puzzle.phase} />
                </div>
            </div>
        </div>
    )
}

const PHASES = 4

const DirectionPhase = ({ phase }: { phase: DirectionModulePhase }) => {
    return (
        <div className="column gap-4px">
            {new Array(PHASES).fill(0).map((_, index) => (
                <Indicator enabled={index >= PHASES - phase} key={index} />
            ))}
        </div>
    )
}
