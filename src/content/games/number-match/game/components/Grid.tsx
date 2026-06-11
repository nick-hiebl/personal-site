import { useGameContext } from '../context'
import type { Coordinate, Grid as GridType, OutputGrid } from '../types'

import './Grid.css'

type Props = {
    grid: OutputGrid | (GridType & { type: 'full' })
    hideName?: boolean
    selectedCoordinate?: Coordinate
    onSelectCoordinate?: (coordinate: Coordinate | undefined) => void
}

export const Grid = ({ grid, hideName, onSelectCoordinate, selectedCoordinate }: Props) => {
    const { output: { players, state, yourId }, socket } = useGameContext()

    const isYourGrid = grid.ownerId === yourId

    return (
        <div className="grid-container">
            {!hideName && (
                <div>Owner: {players.find(p => p.id === grid.ownerId)?.name ?? 'Unknown owner'}</div>
            )}
            <table className="grid">
                <tbody>
                    {grid.values.map((row, rowIndex) => (
                        <tr key={rowIndex} className="grid-row">
                            {row.map((cell, columnIndex) => {
                                const isSelected = selectedCoordinate &&
                                    selectedCoordinate.gridId === grid.id &&
                                    selectedCoordinate.column === columnIndex &&
                                    selectedCoordinate.row === rowIndex

                                return (
                                    <td
                                        key={columnIndex}
                                        className="grid-cell"
                                    >
                                        <button
                                            className="grid-cell-button"
                                            aria-selected={isSelected}
                                            data-revealed={cell.revealed}
                                            onClick={() => {
                                                const coordinate: Coordinate = {
                                                    gridId: grid.id,
                                                    row: rowIndex,
                                                    column: columnIndex,
                                                }

                                                if (state.state !== 'active') {
                                                    return
                                                }

                                                if (isYourGrid && state.action.type === 'tag' && state.action.users.includes(yourId)) {
                                                    socket.emit('tagCell', { coordinate })
                                                } else if (state.action.type === 'guess' && state.action.user === yourId) {
                                                    if (isSelected) {
                                                        onSelectCoordinate?.(undefined)
                                                    } else {
                                                        onSelectCoordinate?.(coordinate)
                                                    }
                                                }
                                            }}
                                        >
                                            {cell.value ?? '?'}
                                            {cell.tags.map(v => v.value.toString()).join(', ')}
                                        </button>
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
