import { useEffect, useRef, useState } from 'react'

import { Indicator } from '../components/Indicator'
import { LightBulb } from '../components/LightBulb'
import { Wire } from '../components/Wire'
import { useGameContext } from '../context'
import type { Module, WireModule } from '../types'

import { DirectionPuzzleDeaf } from './DirectionPuzzle'

export const DeafView = () => {
    const { output } = useGameContext()

    if (output.state.state !== 'deaf') {
        return null
    }

    return (
        <section className="column gap-8px">
            <h2>You are deaf!</h2>
            <InfoPanel />
            {output.state.data.map((puzzle, index) => (
                <DeafPuzzle puzzle={puzzle} key={index} />
            ))}
        </section>
    )
}

const InfoPanel = () => {
    const { output } = useGameContext()

    const state = output.state

    if (state.state !== 'deaf') {
        return null
    }

    return (
        <div className="column gap-4px">
            <span>
                Time left:{' '}
                <Timer
                    timeLeft={state.timeLeft}
                    complete={state.complete}
                />
            </span>
            <div className="row-center gap-8px">
                Lives:
                <div className="row gap-4px">
                    {new Array(state.totalLives).fill(0).map((_, index) => (
                        <Indicator enabled={state.lives > index} key={index} />
                    ))}
                </div>
            </div>
        </div>
    )
}

const DeafPuzzle = ({ puzzle }: { puzzle: Module['deaf'] }) => {
    if (puzzle.id === 'wire') {
        return <WirePuzzle puzzle={puzzle} />
    } else if (puzzle.id === 'direction') {
        return <DirectionPuzzleDeaf puzzle={puzzle} />
    }

    return <span>Unknown puzzle type!</span>
}

const WirePuzzle = ({ puzzle }: { puzzle: WireModule['deaf'] }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | undefined>()

    return (
        <div className="module row gap-8px">
            <div className="row gap-8px">
                {puzzle.wires.map((w, index) => (
                    <div
                        key={index}
                        onMouseEnter={() => {
                            setHoveredIndex(index)
                        }}
                        onMouseLeave={() => {
                            setHoveredIndex(current => current === index ? undefined : current)
                        }}
                        style={{ cursor: 'not-allowed' }}
                    >
                        <Wire color={w} cut={puzzle.cut[index]} isHovered={hoveredIndex === index} />
                    </div>
                ))}
            </div>
            <div className="column-center gap-16px">
                <LightBulb color={puzzle.light} />
                <Indicator enabled={puzzle.complete} />
            </div>
        </div>
    )
}

const Timer = ({ complete, timeLeft }: { timeLeft: number, complete: boolean }) => {
    const frameReqRef = useRef<number | null>(null)
    const [remS, setRem] = useState(timeLeft)

    useEffect(() => {
        const targetEndTime = (performance.now() / 1000) + timeLeft

        const update = () => {
            const remainingTime = (targetEndTime - performance.now() / 1000)
            setRem(remainingTime)

            if (remainingTime > 0) {
                frameReqRef.current = requestAnimationFrame(update)
            }
        }

        frameReqRef.current = requestAnimationFrame(update)

        return () => {
            if (frameReqRef.current) {
                cancelAnimationFrame(frameReqRef.current)
            }
        }
    }, [timeLeft])

    if (remS <= 0) {
        return <time>0:00.0</time>
    }

    const timeToDisplay = complete ? timeLeft : remS

    const mins = Math.floor(timeToDisplay / 60)
    const secs = Math.floor(timeToDisplay % 60)
    const millis = Math.floor((timeToDisplay % 1) * 10)

    return (
        <time>{mins}:{secs.toString().padStart(2, '0')}.{millis}</time>
    )
}
