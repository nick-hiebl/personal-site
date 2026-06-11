import { useGameContext } from '../context'
import type { Grid as GridType, OutputGrid } from '../types'

import './Grid.css'

type Props = {
    grid: OutputGrid | (GridType & { type: 'full' })
    hideName?: boolean
}

export const Grid = ({ grid, hideName }: Props) => {
    const { output: { players } } = useGameContext()

    return (
        <div className="grid-container">
            {!hideName && (
                <div>Owner: {players.find(p => p.id === grid.ownerId)?.name ?? 'Unknown owner'}</div>
            )}
            <table className="grid">
                <tbody>
                    {grid.values.map((row, index) => (
                        <tr key={index} className="grid-row">
                            {row.map((cell, columnIndex) => (
                                <td
                                    key={columnIndex}
                                    className="grid-cell"
                                >
                                    {cell.value ?? '?'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
