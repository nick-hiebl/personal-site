import { Fragment } from 'react'

import { useGameContext } from '../context'
import type { Coordinate, GridValue, OutputGridOption, OutputGridValue, Tag } from '../types'

import { getColName, getRowName } from './Coord'

import './Grid.css'

type Props = {
    grid: OutputGridOption
    selectedCoordinate?: Coordinate
    onSelectCoordinate?: (coordinate: Coordinate | undefined) => void
    isCellInteractive?: (cellValue: OutputGridValue | GridValue) => boolean
    specialSymbol?: React.ReactNode
    isGridSelected?: boolean
}

export const Grid = ({ grid, onSelectCoordinate, isCellInteractive, isGridSelected, selectedCoordinate, specialSymbol }: Props) => {
    const { output: { players, state, yourId } } = useGameContext()

    const valueDetails = state.state === 'pending' ? [] : state.valueDetails

    const ownerName = !grid.ownerId ? 'Unassigned' : players.find(p => p.id === grid.ownerId)?.name ?? 'Unknown owner'

    const tableWidth = (32 + 2) * grid.values[0].length + 8

    const isMyGrid = grid.ownerId === yourId

    const isOwnerTurn = state.state === 'active' &&
        (state.action.type === 'tag' ? state.action.users.includes(grid.ownerId) : state.action.type === 'guess' && state.action.user === grid.ownerId)

    return (
        <div className="grid-container" data-selected={isGridSelected}>
            <div className="row grid-title-row">
                <div className="grid-title">
                    #{grid.id + 1} - {ownerName}
                </div>
                {specialSymbol ??
                    (isOwnerTurn ? (
                        <div className={isMyGrid ? 'my-turn-now' : undefined}>{isMyGrid ? '❗' : '🤔'}</div>
                    ) : null)}
            </div>
            <table className="grid" width={tableWidth} style={{ width: `${tableWidth}px` }}>
                <thead className="grid-header">
                    <tr className="grid-row">
                        <th />
                        {grid.values[0].map((_, columnIndex) => (
                            <th key={columnIndex} className="grid-heading">{getColName(columnIndex)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="grid-body">
                    {grid.values.map((row, rowIndex) => (
                        <tr key={rowIndex} className="grid-row">
                            <td className="grid-row-label">{getRowName(rowIndex)}</td>
                            {row.map((cell, columnIndex) => {
                                if (cell.empty) {
                                    return <td key={columnIndex} />
                                }

                                const isSelected = selectedCoordinate &&
                                    selectedCoordinate.gridId === grid.id &&
                                    selectedCoordinate.column === columnIndex &&
                                    selectedCoordinate.row === rowIndex

                                const isYellow = (cell.value != undefined &&
                                    valueDetails.find(v => v.value === cell.value)?.isYellow) ?? false
                                const isRed = (cell.value != undefined &&
                                    valueDetails.find(v => v.value === cell.value)?.isRed) ?? false

                                return (
                                    <td
                                        key={columnIndex}
                                        className="grid-cell"
                                    >
                                        <button
                                            className="grid-cell-button"
                                            aria-selected={isSelected}
                                            disabled={isCellInteractive ? !isCellInteractive(cell) : true}
                                            data-revealed={cell.revealed ? isYellow ? 'yellow' : isRed ? 'red' : true : undefined}
                                            onClick={() => {
                                                const coordinate: Coordinate = {
                                                    gridId: grid.id,
                                                    row: rowIndex,
                                                    column: columnIndex,
                                                }

                                                if (isSelected) {
                                                    onSelectCoordinate?.(undefined)
                                                } else {
                                                    onSelectCoordinate?.(coordinate)
                                                }
                                            }}
                                        >
                                            {cell.value ?? '?'}
                                            {isYellow && <span className="tag-bubble yellow non-inverse" />}
                                            {isRed && <span className="tag-bubble red non-inverse" />}
                                        </button>
                                        {!cell.revealed && (
                                            <Tags tags={cell.tags} />
                                        )}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const Tags = ({ tags }: { tags: Tag[] }) => {
    if (tags.length === 0) {
        return null
    }

    return (
        <div className="cell-tags">
            {tags.map((v, index) => (
                <Fragment key={index}>
                    {v.type === 'value' && v.value.toString()}
                    {v.type === 'yellow' && <span className="tag-bubble yellow" />}
                    {index < tags.length - 1 && ', '}
                </Fragment>
            ))}
        </div>
    )
}
