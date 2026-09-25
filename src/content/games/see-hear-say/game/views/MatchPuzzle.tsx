import { Fragment } from 'react'

import { BrailleDigit } from '../components/Braille'
import { Indicator } from '../components/Indicator'
import { useGameContext } from '../context'
import type { MatchChart, MatchModule } from '../types'

import './match-puzzle.css'

export const MatchPuzzleBlind = ({ puzzle }: { puzzle: MatchModule['blind'] }) => {
    const { socket } = useGameContext()

    return (
        <div className="module column-center gap-16px">
            <div className="row full-width gap-16px">
                <button
                    className="match-puzzle-button"
                    onClick={() => {
                        socket.emit('match-submit', { index: puzzle.index })
                    }}
                />
                <Indicator enabled={puzzle.complete} />
            </div>
            <div className="match-puzzle-grid">
                {puzzle.pairs.map(([a, b], index) => (
                    <div key={index} className="match-puzzle-cell">
                        <button
                            className="match-puzzle-toggle"
                            onClick={() => {
                                socket.emit('match-toggle', { index: puzzle.index, buttonIndex: index })
                            }}
                        >
                            {a}
                            <span
                                className="match-puzzle-indicator"
                                style={{ backgroundColor: 'grey' }}
                            />
                            {b}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const MatchPuzzleDeaf = ({ puzzle }: { puzzle: MatchModule['deaf'] }) => {
    return (
        <div className="module column-center gap-16px">
            <div className="row full-width gap-16px">
                <button className="match-puzzle-button blind">
                    {puzzle.word}
                </button>
                <Indicator enabled={puzzle.complete} />
            </div>
            <div className="match-puzzle-grid">
                {puzzle.pairs.map(([a, b], index) => (
                    <div key={index} className="match-puzzle-cell">
                        <div className="match-puzzle-toggle blind">
                            <BrailleDigit digit={a} />
                            <span
                                className="match-puzzle-indicator"
                                style={{ backgroundColor: puzzle.toggles[index] }}
                            />
                            <BrailleDigit digit={b} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const PUZZLE_REFERENCE: MatchModule['deaf'] = {
    id: 'match',
    index: 0,
    pairs: [[1, 2], [3, 4], [5, 6], [7, 8]],
    toggles: ['red', 'green', 'red', 'red'],
    word: 'ok',
    complete: false,
}

const MatchPuzzleReference = () => {
    return <MatchPuzzleDeaf puzzle={PUZZLE_REFERENCE} />
}

export const MatchPuzzleRule = ({ rule }: { rule: MatchModule['mute'] }) => {
    return (
        <div className="rule-section column gap-16px">
            <h3>Match</h3>
            <div>
                Use the word on the submit button to determine which graph
                should be referenced for determining connections.
            </div>
            <div>
                Toggle the pairs of numbers to have a green or red light
                according to whether or not they are connected numbers in the
                appropriate graph below.
            </div>
            <div>Puzzle looks as below:</div>
            <div>
                <MatchPuzzleReference />
            </div>
            {(Object.keys(rule.chartLayout) as MatchChart[]).map(chart => {
                const data = CHART_DATA[chart]

                if (!data) {
                    return null
                }

                const word = Object.entries(rule.wordToChart).find(w => w[1] === chart)?.[0]

                return (
                    <MatchChart
                        key={chart}
                        word={word ?? 'unknown'}
                        numbers={rule.chartLayout[chart]}
                        circles={data.circles}
                        adjacency={data.adjacency}
                    />
                )
            })}
        </div>
    )
}

type ChartData = {
    circles: { x: number, y: number }[]
    adjacency: [number, number][]
}

const CHART_DATA: Record<MatchChart, ChartData> = {
    a: {
        circles: [
            { x: 30, y: 30 },
            { x: 90, y: 30 },
            { x: 150, y: 30 },
            { x: 210, y: 30 },
            { x: 30, y: 90 },
            { x: 90, y: 90 },
            { x: 150, y: 90 },
            { x: 210, y: 90 },
        ],
        adjacency: [
            [0, 1],
            [1, 2],
            [2, 3],
            [4, 5],
            [5, 6],
            [6, 7],
            [0, 4],
            [1, 5],
            [2, 6],
            [3, 7],
            [0, 5],
            [5, 2],
            [2, 7],
        ],
    },
    b: {
        circles: [
            { x: 90, y: 30 },
            { x: 30, y: 90 },
            { x: 150, y: 90 },
            { x: 90, y: 150 },
            { x: 210, y: 90 },
            { x: 270, y: 30 },
            { x: 270, y: 150 },
            { x: 330, y: 90 },
        ],
        adjacency: [
            [0, 1],
            [0, 3],
            [0, 5],
            [1, 2],
            [1, 3],
            [3, 6],
            [4, 5],
            [5, 6],
            [5, 7],
            [6, 7],
        ],
    },
    c: {
        circles: [
            { x: 30, y: 30 },
            { x: 90, y: 150 },
            { x: 150, y: 90 },
            { x: 210, y: 150 },
            { x: 270, y: 30 },
            { x: 150, y: 150 },
            { x: 90, y: 210 },
            { x: 210, y: 210 },
        ],
        adjacency: [
            [0, 1],
            [0, 2],
            [0, 4],
            [1, 2],
            [2, 3],
            [2, 4],
            [3, 4],
            [5, 6],
            [5, 7],
            [6, 7],
        ],
    },
    d: {
        circles: [
            { x: 30, y: 30 },
            { x: 330, y: 30 },
            { x: 330, y: 270 },
            { x: 30, y: 270 },
            { x: 120, y: 150 },
            { x: 180, y: 90 },
            { x: 240, y: 150 },
            { x: 180, y: 210 },
        ],
        adjacency: [
            [0, 1],
            [0, 3],
            [0, 4],
            [0, 5],
            [1, 5],
            [1, 6],
            [1, 2],
            [2, 3],
            [2, 6],
            [2, 7],
            [3, 4],
            [3, 7],
            [4, 5],
            [4, 7],
            [5, 6],
            [6, 7],
        ],
    },
}

type MatchChartProps = {
    word: string
    numbers: number[]
    circles: { x: number, y: number }[]
    adjacency: [number, number][]
}

const MatchChart = ({ word, numbers, circles, adjacency }: MatchChartProps) => {
    const MAX_X = Math.max(...circles.map(c => c.x)) + 30
    const MAX_Y = Math.max(...circles.map(c => c.y)) + 30

    return (
        <div className="row-center gap-16px">
            <span className="match-puzzle-word-name">{word}</span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${MAX_X} ${MAX_Y}`}
                width={MAX_X}
                height={MAX_Y}
            >
                {adjacency.map(([start, end], index) => (
                    <line
                        key={index}
                        x1={circles[start].x}
                        y1={circles[start].y}
                        x2={circles[end].x}
                        y2={circles[end].y}
                        stroke="var(--color-border)"
                        strokeWidth="3"
                    />
                ))}
                {circles.map(({ x, y }, index) => (
                    <Fragment key={index}>
                        <circle
                            cx={x}
                            cy={y}
                            r="20"
                            fill="white"
                            stroke="var(--color-border)"
                            strokeWidth="3"
                        />
                        <text x={x} y={y + 8} className="match-puzzle-chart-text" textAnchor="middle">
                            {numbers[index]}
                        </text>
                    </Fragment>
                ))}
            </svg>
        </div>
    )
}
