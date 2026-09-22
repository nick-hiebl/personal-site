import type { BaseColor, BlindColor } from '../types'

type Props = {
    color: BaseColor | BlindColor
    cut?: boolean
}

export const Wire = ({ color, cut }: Props) => {
    const wireColor = color === 'color' ? 'grey' : color
    const conductorColor = color === 'color' ? 'var(--color-border)' : 'orange'

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 200"
            width="50"
            height="200"
        >
            {cut ? (
                <>
                    <line
                        x1="25"
                        y1="105"
                        x2="25"
                        y2="175"
                        stroke={conductorColor}
                        strokeWidth="3"
                        strokeLinecap="butt"
                    />
                    <line
                        x1="25"
                        y1="25"
                        x2="25"
                        y2="95"
                        stroke={conductorColor}
                        strokeWidth="3"
                        strokeLinecap="butt"
                    />
                    <line
                        x1="25"
                        y1="25"
                        x2="25"
                        y2="70"
                        stroke={wireColor}
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                    <line
                        x1="25"
                        y1="70"
                        x2="25"
                        y2="90"
                        stroke={wireColor}
                        strokeWidth="10"
                        strokeLinecap="butt"
                    />
                    <line
                        x1="25"
                        y1="130"
                        x2="25"
                        y2="175"
                        stroke={wireColor}
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                    <line
                        x1="25"
                        y1="110"
                        x2="25"
                        y2="130"
                        stroke={wireColor}
                        strokeWidth="10"
                        strokeLinecap="butt"
                    />
                </>
            ) : (
                <line
                    x1="25"
                    y1="25"
                    x2="25"
                    y2="175"
                    stroke={color === 'color' ? 'grey' : color}
                    strokeWidth="10"
                    strokeLinecap="round"
                />
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
