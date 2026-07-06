import { useGameContext } from '../context'
import type { Coordinate } from '../types'

export const GridName = ({ id }: { id: number }) => {
    return <span>#{id + 1}</span>
}

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
            <GridName id={coordinate.gridId} />: {getColName(coordinate.column)}{getRowName(coordinate.row)}
        </span>
    )
}

export const getColName = (columnIndex: number) => {
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[columnIndex]
}

export const getRowName = (rowIndex: number) => {
    return rowIndex + 1
}
