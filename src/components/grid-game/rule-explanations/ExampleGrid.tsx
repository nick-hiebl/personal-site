import type { CSSProperties, ReactNode } from 'react'

import './ExampleGrid.css'

type Props = {
    ruleIcon?: ReactNode | null
    state: (boolean | null)[]
}

export const ExampleGrid = ({ ruleIcon, state }: Props) => {
    return (
        <div
            className="example-grid"
            style={{
                '--columns': state.length + (ruleIcon ? 1 : 0),
                '--rows': 1,
            } as CSSProperties}
        >
            <div className="example-grid-grid">
                {state.map((value, index) => value === true ? (
                    <div key={index} className="example-grid-cell">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="white" />
                        </svg>
                    </div>
                ) : value === false ? (
                    <div key={index} className="example-grid-cell">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="39"
                                stroke="rgba(255, 255, 255, 0.6)"
                                fill="transparent"
                                strokeWidth="6"
                                strokeDasharray="11.3 11.3"
                            />
                        </svg>
                    </div>
                ) : (
                    <div key={index} className="example-grid-cell" />
                ))}
                {ruleIcon}
                {/* {new Array(width + 1).fill(0).map((_, index) => {
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
                })} */}
                {/* {state.values.flatMap((row, rowIndex) => {
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
                })} */}
            </div>
        </div>
    )
}
