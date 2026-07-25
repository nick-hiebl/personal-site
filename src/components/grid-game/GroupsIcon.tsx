import { useMemo } from 'react'

type GroupsIconProps = {
    count: number
    mode: 'horizontal' | 'vertical'
}

const GRID_SCALE = 10
const RADIUS = 8

export const GroupsIcon = ({ count, mode }: GroupsIconProps) => {
    if (!count) {
        throw Error('Invalid groups count')
    }

    const { rows, boxes, viewBox } = useMemo(() => {
        const gridSize = Math.ceil(Math.sqrt(count))
    
        const rows = Math.ceil(count / gridSize)
    
        const boxes = new Array(rows).fill(0).map((_, index) => (mode === 'horizontal' ? index < rows - 1 : index > 0) ? gridSize : count - gridSize * (rows - 1))

        const scale = GRID_SCALE * gridSize
        const viewBox = `${-scale / 2} ${-scale / 2} ${scale} ${scale}`

        return { rows, boxes, viewBox }
    }, [count, mode])


    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} className="clue-icon">
            {boxes.flatMap((group, rowIndex) => new Array(group).fill(0).map((_, colIndex, row) => (
                <rect
                    key={`${rowIndex}-${colIndex}`}
                    x={(colIndex - row.length / 2) * GRID_SCALE + (GRID_SCALE - RADIUS) / 2}
                    y={(rowIndex - rows / 2) * GRID_SCALE + (GRID_SCALE - RADIUS) / 2}
                    width={RADIUS}
                    height={RADIUS}
                    fill="white"
                />
            )))}
        </svg>
    )
}
