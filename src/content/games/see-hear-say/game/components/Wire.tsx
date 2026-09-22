import type { BaseColor, BlindColor } from '../types'

type Props = {
    color: BaseColor | BlindColor
    cut?: boolean
    isHovered?: boolean
}

const WIRE_PATH = 'M 25 25 Q 28 60 25 100 Q 22 140 25 175'

const WIRE_SVG_PROPS = {
    d: WIRE_PATH,
    pathLength: 100,
    fill: 'transparent',
}

export const Wire = ({ color, cut, isHovered }: Props) => {
    const wireColor = color === 'color' ? 'grey' : color
    const conductorColor = color === 'color' ? 'white' : 'orange'

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 200"
            width="50"
            height="200"
        >
            <rect x="10" y="10" width="30" height="30" rx="5" ry="5" fill="#666666" />
            <rect x="10" y="160" width="30" height="30" rx="5" ry="5" fill="#666666" />
            {cut ? (
                <>
                    <path
                        {...WIRE_SVG_PROPS}
                        stroke={conductorColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="46 100"
                    />
                    <path
                        {...WIRE_SVG_PROPS}
                        stroke={conductorColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="0 54 100"
                    />
                    <path
                        {...WIRE_SVG_PROPS}
                        stroke={wireColor}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray="10 100"
                    />
                    <path
                        {...WIRE_SVG_PROPS}
                        stroke={wireColor}
                        strokeWidth="10"
                        strokeLinecap="butt"
                        strokeDasharray="42 100"
                    />
                    <path
                        {...WIRE_SVG_PROPS}
                        stroke={wireColor}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray="0 90 10"
                    />
                    <path
                        {...WIRE_SVG_PROPS}
                        stroke={wireColor}
                        strokeWidth="10"
                        strokeLinecap="butt"
                        strokeDasharray="0 58 100"
                    />
                </>
            ) : (
                <>
                    {isHovered && (
                        <path
                            {...WIRE_SVG_PROPS}
                            stroke="white"
                            strokeWidth="14"
                            strokeLinecap="round"
                        />
                    )}
                    <path
                        {...WIRE_SVG_PROPS}
                        stroke={wireColor}
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                </>
            )}
        </svg>
    )
}

export const WireSnip = ({ color }: Pick<Props, 'color'>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 80"
            width="50"
            height="80"
        >
            <path
                d="M 30 10 Q 30 25 25 40 Q 20 55 20 70"
                stroke="black"
                strokeWidth="14"
                strokeLinecap="round"
            />
            <path
                d="M 30 10 Q 30 25 25 40 Q 20 55 20 70"
                stroke={color === 'color' ? 'grey' : color}
                strokeWidth="10"
                strokeLinecap="round"
            />
            <line
                x1="15"
                y1="32"
                x2="35"
                y2="48"
                strokeWidth="10"
                stroke="black"
                strokeLinecap="round"
            />
            <line
                x1="15"
                y1="48"
                x2="35"
                y2="32"
                strokeWidth="10"
                stroke="black"
                strokeLinecap="round"
            />
            <line
                x1="15"
                y1="32"
                x2="35"
                y2="48"
                strokeWidth="6"
                stroke="white"
                strokeLinecap="round"
            />
            <line
                x1="15"
                y1="48"
                x2="35"
                y2="32"
                strokeWidth="6"
                stroke="white"
                strokeLinecap="round"
            />
        </svg>
    )
}
