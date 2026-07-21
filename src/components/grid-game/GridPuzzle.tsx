import { type CSSProperties, useEffect, useMemo, useState } from 'react'

import type { PuzzleSchema, PuzzleState } from './schema/types'

import { EdgeRuleComponent } from './EdgeRule'
import { isCorrect } from './schema/validate'

import './GridPuzzle.css'

type Size = 'small' | 'medium'

const SIZE_PROPERTIES: Record<Size, CSSProperties> = {
    medium: {
        '--info-scale': '64px',
        '--cell-scale': '96px',
        fontSize: '32px',
        '--gap': '8px',
        '--border': '4px',
    } as CSSProperties,
    small: {
        '--info-scale': '32px',
        '--cell-scale': '48px',
        fontSize: '16px',
        '--gap': '4px',
        '--border': '2px',
    } as CSSProperties,
}

type Props = {
    schema: PuzzleSchema

    /* The puzzle should be centered horitzontally within the content area */
    isCentered?: boolean

    size?: Size
}

const PAGE_WIDTH = 720

export const GridPuzzle = ({ isCentered, schema }: Props) => {
    const { width, height } = schema

    const [fontScale, setFontScale] = useState<`${number}px` | undefined>(undefined)

    // Effect to shrink font scale to fit puzzle to screen
    useEffect(() => {
        const widthAtOne = 236.78
        const widthAtTwo = 319.98
        const growth = widthAtTwo - widthAtOne

        const actualPxWidth = (width - 1) * growth + widthAtOne

        const availableWidth = Math.min(window.screen.availWidth, PAGE_WIDTH)

        if (actualPxWidth > availableWidth) {
            const BASE_FONT_SCALE = 32
            const MIN_FONT_SCALE = 8
            const scale = availableWidth / actualPxWidth * BASE_FONT_SCALE
            setFontScale(`${Math.max(scale, MIN_FONT_SCALE)}px`)
        }
    }, [height, width])

    const [state, setState] = useState<PuzzleState>(() => {
        return {
            values: new Array(height)
                .fill(null)
                .map((_, rowIndex) =>
                    new Array(width)
                        .fill(null)
                        .map((val, columnIndex) => {
                            const cellRule = schema.cellRules?.find(rule => rule.row === rowIndex && rule.column === columnIndex)

                            if (cellRule?.rule.type === 'forced') {
                                return cellRule.rule.state
                            }

                            return val
                        }),
                ),
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
                                return false
                            } else if (cell === false) {
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
                ...SIZE_PROPERTIES.medium,
                fontSize: fontScale ?? SIZE_PROPERTIES.medium.fontSize,
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
                        ...row.map((cell, cellIndex) => {
                            const key = `${rowIndex}-${cellIndex}`

                            const contents = cell === true ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="50" fill="white" />
                                </svg>
                            ) : cell === false ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="47"
                                        stroke="rgba(255, 255, 255, 0.6)"
                                        fill="transparent"
                                        strokeWidth="6"
                                        strokeDasharray="11.3 11.3"
                                    />
                                </svg>
                            ) : null

                            const relevantCellRule = schema.cellRules?.find(rule => rule.row === rowIndex && rule.column === cellIndex)

                            if (relevantCellRule?.rule.type === 'forced') {
                                return (
                                    <div key={key} className="grid-puzzle-forced-cell">{contents}</div>
                                )
                            }

                            return (
                                <button
                                    className="grid-puzzle-button"
                                    key={key}
                                    onClick={() => {
                                        onCellClicked(rowIndex, cellIndex, false)
                                    }}
                                    onContextMenu={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.preventDefault()

                                        onCellClicked(rowIndex, cellIndex, true)
                                    }}
                                >
                                    {contents}
                                </button>

                            )
                        }),
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
