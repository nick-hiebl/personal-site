import { useEffect, useRef, useState } from 'react'

import { DirectionalArrow } from '../components/DirectionalArrow'
import { Indicator } from '../components/Indicator'
import { useGameContext } from '../context'
import type { ChartFunction, ChartModule } from '../types'

import './chart-puzzle.css'

const useIsStarSuppressed = (resetIndex: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [isStarSuppressed, setStarSuppressed] = useState(false)

    useEffect(() => {
        if (resetIndex === 0) {
            return
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        setStarSuppressed(true)

        timeoutRef.current = setTimeout(() => {
            setStarSuppressed(false)
        }, 500)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [resetIndex])

    return isStarSuppressed
}

export const ChartPuzzleBlind = ({ puzzle }: { puzzle: ChartModule['blind']}) => {
    const { socket } = useGameContext()
    
    const [starPresses, setStarPresses] = useState(0)

    const isStarSuppressed = useIsStarSuppressed(starPresses)

    return (
        <div className="module column gap-16px">
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace" />
                </div>
                <Indicator enabled={puzzle.complete} />
            </div>
            <div className="row-center gap-16px spread full-width">
                <button
                    onClick={() => {
                        socket.emit('chart-step', {
                            index: puzzle.index,
                            direction: 'left',
                        })
                    }}
                >
                    <DirectionalArrow direction="left" />
                </button>
                <button
                    className="chart-big-button"
                    onClick={() => {
                        socket.emit('chart-submit', {
                            index: puzzle.index,
                        })
                    }}
                >
                    SUBMIT
                </button>
                <button
                    onClick={() => {
                        socket.emit('chart-step', {
                            index: puzzle.index,
                            direction: 'right',
                        })
                    }}
                >
                    <DirectionalArrow direction="right" />
                </button>
            </div>
            <div className="chart-panel-row">
                {puzzle.glow ? (
                    <div className="chart-panel chart-glowing" />
                ) : (
                    <div className="chart-panel chart" />
                )}
                <button
                    className="chart-button"
                    onClick={() => {
                        if (puzzle.complete) {
                            return
                        }

                        setStarPresses(c => c + 1)
                        socket.emit('chart-button', {
                            index: puzzle.index,
                            button: 'star',
                        })
                    }}
                >
                    <span className="chart-button-primary">★</span>
                    <span className="chart-button-indicator" data-enabled={isStarSuppressed} />
                </button>
            </div>
            <div className="chart-panel-row">
                <button
                    className="chart-button"
                    onClick={() => {
                        socket.emit('chart-button', {
                            index: puzzle.index,
                            button: 'plus',
                        })
                    }}
                >
                    <span className="chart-button-primary">+</span>
                    <span className="chart-button-indicator" data-enabled={puzzle.incActive === 'plus'} />
                </button>
                <button
                    className="chart-button"
                    onClick={() => {
                        socket.emit('chart-button', {
                            index: puzzle.index,
                            button: 'minus',
                        })
                    }}
                >
                    <span className="chart-button-primary">-</span>
                    <span className="chart-button-indicator" data-enabled={puzzle.incActive === 'minus'} />
                </button>
                <button
                    className="chart-button"
                    onClick={() => {
                        socket.emit('chart-button', {
                            index: puzzle.index,
                            button: 'slash',
                        })
                    }}
                >
                    <span className="chart-button-primary">/</span>
                    <span className="chart-button-indicator" data-enabled={puzzle.slashPressed} />
                </button>
            </div>
        </div>
    )
}

const DATA_POINTS = 40

const useChartData = (resetIndex: number, step: number) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const [data, setData] = useState([50])

    useEffect(() => {
        setData([50])
    }, [resetIndex])

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        intervalRef.current = setInterval(() => {
            setData(currentData => {
                const last = currentData[currentData.length - 1] ?? 50
                const stepNext = last + 3 * step
                const next = stepNext > 99
                    ? stepNext - Math.random() / 2
                    : stepNext < 1
                        ? stepNext + Math.random() / 2
                        : stepNext + Math.random() - 0.5

                const boundNext = next < 0
                    ? 100
                    : next > 100
                        ? 0
                        : next

                if (currentData.length >= DATA_POINTS) {
                    return currentData.slice(currentData.length - DATA_POINTS + 1).concat(boundNext)
                } else {
                    return currentData.concat(boundNext)
                }
            })
        }, 100)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [step])

    return data
}

export const ChartPuzzleDeaf = ({ puzzle }: { puzzle: ChartModule['deaf']}) => {
    const isStarSuppressed = useIsStarSuppressed(puzzle.resetIndex)

    return (
        <div className="module column gap-16px">
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace">
                        {puzzle.displayFunction}
                    </div>
                </div>
                <Indicator enabled={puzzle.complete} />
            </div>
            <div className="row-center gap-16px spread full-width">
                <button disabled>
                    <DirectionalArrow direction="left" />
                </button>
                <button disabled className="chart-big-button">SUBMIT</button>
                <button
                    disabled
                >
                    <DirectionalArrow direction="right" />
                </button>
            </div>
            <div className="chart-panel-row">
                <div className="chart-panel">
                    <ChartChart puzzle={puzzle} />
                </div>
                <button
                    className="chart-button"
                    disabled
                >
                    <span className="chart-button-primary">★</span>
                    <span className="chart-button-indicator" data-enabled={isStarSuppressed} />
                </button>
            </div>
            <div className="chart-panel-row">
                <button
                    className="chart-button"
                    disabled
                >
                    <span className="chart-button-primary">+</span>
                    <span className="chart-button-indicator" data-enabled={puzzle.incActive === 'plus'} />
                </button>
                <button
                    className="chart-button"
                    disabled
                >
                    <span className="chart-button-primary">-</span>
                    <span className="chart-button-indicator" data-enabled={puzzle.incActive === 'minus'} />
                </button>
                <button
                    className="chart-button"
                    disabled
                >
                    <span className="chart-button-primary">/</span>
                    <span className="chart-button-indicator" data-enabled={puzzle.slashPressed} />
                </button>
            </div>
        </div>
    )
}

const ChartChart = ({ puzzle }: { puzzle: ChartModule['deaf'] }) => {
    const data = useChartData(puzzle.resetIndex, puzzle.output)

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 400 200`}
            width="400"
            height="200"
        >
            {data.map((column, index) => (
                <rect
                    x={index * 400 / DATA_POINTS}
                    y={2 * (100 - column)}
                    width={400 / DATA_POINTS}
                    height={2 * column}
                    fill={puzzle.colorChanged ? 'red' : 'white'}
                />
            ))}
        </svg>
    )
}

export const ChartPuzzleReference = () => {
    return (
        <div className="module column gap-16px">
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace">
                        examplefunc()
                    </div>
                </div>
                <Indicator enabled={false} />
            </div>
            <div className="row-center gap-16px spread full-width">
                <button disabled>
                    <DirectionalArrow direction="left" />
                </button>
                <button disabled className="chart-big-button">SUBMIT</button>
                <button
                    disabled
                >
                    <DirectionalArrow direction="right" />
                </button>
            </div>
            <div className="chart-panel-row">
                <div className="chart-panel">
                </div>
                <button
                    className="chart-button"
                    disabled
                >
                    <span className="chart-button-primary">★</span>
                    <span className="chart-button-indicator" />
                </button>
            </div>
            <div className="chart-panel-row">
                <button
                    className="chart-button"
                    disabled
                >
                    <span className="chart-button-primary">+</span>
                    <span className="chart-button-indicator" data-enabled={true} />
                </button>
                <button
                    className="chart-button"
                    disabled
                >
                    <span className="chart-button-primary">-</span>
                    <span className="chart-button-indicator" />
                </button>
                <button
                    className="chart-button"
                    disabled
                >
                    <span className="chart-button-primary">/</span>
                    <span className="chart-button-indicator" />
                </button>
            </div>
        </div>
    )
}

export const ChartPuzzleRule = ({ rule }: { rule: ChartModule['mute'] }) => {
    const functionNames = Object.keys(rule.functions) as ChartFunction[]

    return (
        <div className="rule-section column gap-16px">
            <h3>Chart</h3>
            <div>
                Determine which function is active by interacting with the operation buttons and
                observing their impact on the chart.
            </div>
            <div>Puzzle looks as below:</div>
            <div className="shrink-module">
                <ChartPuzzleReference />
            </div>
            <div>
                The correct function name must be selected then submitted at the top of the module.
            </div>
            <dl>
                {functionNames.map((functionName) => (
                    <div key={functionName}>
                        <dt className="chart-monospace">{functionName}</dt>
                        <dd>
                            Will {rule.functions[functionName].plus} when <span className="chart-monospace">+</span> is enabled.
                            {' '}
                            Will {rule.functions[functionName].minus} when <span className="chart-monospace">-</span> is enabled.
                            {' '}
                            {rule.functions[functionName].slash === 'color' ? (
                                <span>
                                    Chart will turn red when <span className="chart-monospace">/</span> is enabled.
                                </span>
                            ) : (
                                <span>
                                    Will glow and pulse green when <span className="chart-monospace">/</span> is enabled.
                                </span>
                            )}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    )
}
