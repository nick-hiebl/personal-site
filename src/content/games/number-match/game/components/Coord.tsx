import { useGameContext } from '../context'
import type { Coordinate } from '../types'

type CoordinateProps = {
    coordinate: Coordinate
}

export const Coord = ({ coordinate }: CoordinateProps) => {
    const { output } = useGameContext()

    const state = output.state

    if (state.state === 'pending') {
        return null
    }

    const grid = state.grids.find(g => g.id === coordinate.gridId)

    if (!grid) {
        return null
    }

    return (
        <span className="coordinate">
            G{coordinate.gridId}: {getColName(coordinate.column)}{getRowName(coordinate.row, grid.values.length)}
        </span>
    )
}

export const getColName = (columnIndex: number) => {
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[columnIndex]
}

export const getRowName = (rowIndex: number, numRows: number) => {
    return numRows - rowIndex
}
