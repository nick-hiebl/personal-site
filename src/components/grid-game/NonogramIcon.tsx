type NonogramIconProps = {
    groups: number[]
}

const GRID_Y_SCALE = 15
const GRID_X_SCALE = 10
const RADIUS = 3.2

export const NonogramIcon = ({ groups }: NonogramIconProps) => {
    if (!groups.length) {
        throw Error('Invalid nonogram groups')
    }

    const maxGroup = groups.reduce((max, current) => Math.max(max, current), groups[0])

    const maxScale = Math.max(groups.length * GRID_Y_SCALE, maxGroup * GRID_X_SCALE)

    const centerX = maxGroup * GRID_X_SCALE / 2
    const centerY = groups.length * GRID_Y_SCALE / 2

    const viewBox = `${centerX - maxScale / 2} ${centerY - maxScale / 2} ${maxScale} ${maxScale}`

    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} className="clue-icon">
            {groups.flatMap((group, rowIndex) => new Array(group).fill(0).map((_, colIndex) => (
                <circle
                    key={`${rowIndex}-${colIndex}`}
                    cx={((maxGroup - group) / 2 + colIndex + 0.5) * GRID_X_SCALE}
                    cy={(rowIndex + 0.5) * GRID_Y_SCALE}
                    r={RADIUS}
                    fill="white"
                />
            )))}
            {groups.map((_, rowIndex) => (rowIndex === 0 && groups.length > 1) ? null : (
                <line
                    key={rowIndex}
                    x1={0}
                    x2={maxGroup * GRID_X_SCALE}
                    y1={rowIndex * GRID_Y_SCALE}
                    y2={rowIndex * GRID_Y_SCALE}
                    strokeWidth="2"
                    strokeLinecap="round"
                    stroke="white"
                />
            ))}
            {groups.length === 1 && (
                <line
                    x1={0}
                    x2={maxGroup * GRID_X_SCALE}
                    y1={groups.length * GRID_Y_SCALE}
                    y2={groups.length * GRID_Y_SCALE}
                    strokeWidth="2"
                    strokeLinecap="round"
                    stroke="white"
                />
            )}
        </svg>
    )
}
