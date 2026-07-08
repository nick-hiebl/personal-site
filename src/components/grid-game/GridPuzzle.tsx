import { type CSSProperties, useMemo, useState } from 'react'

import type { PuzzleSchema, PuzzleState } from './schema/types'

import './GridPuzzle.css'
import { EdgeRuleComponent } from './EdgeRule'
import { isCorrect } from './schema/validate'

type Props = {
    schema: PuzzleSchema

    /* The puzzle should be centered horitzontally within the content area */
    isCentered?: boolean
}

export const GridPuzzle = ({ isCentered, schema }: Props) => {
    const { width, height } = schema

    const [state, setState] = useState<PuzzleState>(() => {
        return {
            values: new Array(height).fill(0).map(() => new Array(width).fill(null)),
        }
    })

    const correct = useMemo(() => isCorrect(schema, state), [schema, state])

    const onCellClicked = (rowIndex: number, cellIndex: number, isRightClick: boolean) => {
        setState(currentState => ({
            values: currentState.values.map((row, rIndex) => (
                row.map((cell, cIndex) => {
                    if (rowIndex === rIndex && cellIndex === cIndex) {
                        if (isRightClick) {
                            if (cell === false) {
                                return null
                            } else {
                                return false
                            }
                        } else {
                            if (cell === true) {
                                return null
                            } else {
                                return true
                            }
                        }
                    }

                    return cell
                })
            ))
        }))
    }

    const puzzle = (
        <div
            id="grid-puzzle"
            className="grid-puzzle-container"
            data-correct={correct}
            style={{
                '--columns': width,
                '--rows': height,
            } as CSSProperties}
        >
            <div className="grid-puzzle-grid">
                {new Array(width + 1).fill(0).map((_, index) => {
                    const verticalEdgeRule = schema.verticalEdgeRules?.[index] ?? null

                    return (
                        <EdgeRuleComponent
                            key={index}
                            index={index}
                            state={state}
                            rule={verticalEdgeRule}
                            mode="vertical"
                        />
                    )
                })}
                {state.values.flatMap((row, rowIndex) => {
                    const horizontalEdgeRule = schema.horizontalEdgeRules?.[rowIndex] ?? null

                    return [
                        ...row.map((cell, cellIndex) => (
                            <button
                                className="grid-puzzle-button"
                                key={`${rowIndex}-${cellIndex}`}
                                onClick={() => {
                                    onCellClicked(rowIndex, cellIndex, false)
                                }}
                                onContextMenu={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault()

                                    onCellClicked(rowIndex, cellIndex, true)
                                }}
                            >
                                {cell === true ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="50" fill="white" />
                                    </svg>
                                ) : cell === false ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="47"
                                            stroke="white"
                                            fill="transparent"
                                            strokeWidth="6"
                                            strokeDasharray="11.3 11.3"
                                        />
                                    </svg>
                                ) : null}
                            </button>
                        )),
                        <EdgeRuleComponent
                            key={rowIndex}
                            index={rowIndex}
                            state={state}
                            rule={horizontalEdgeRule}
                            mode="horizontal"
                        />,
                    ]
                })}
            </div>
        </div>
    )

    if (isCentered) {
        return <div className="column-center">{puzzle}</div>
    }

    return puzzle
}
