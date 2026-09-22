import type { BaseColor, BlindColor } from '../types'

type Props = {
    color: BaseColor | BlindColor
}

export const LightBulb = ({ color }: Props) => {
    const col = color === 'color' ? 'grey' : color
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-2 -2 54 76"
            width="50"
            height="72"
        >
            <path
                d="M 27 53 Q 27 40 29 30 T 33 28 T 25 35 T 17 28 T 21 30 T 23 53"
                stroke="var(--color-border)"
                strokeWidth="2"
                fill="transparent"
            />
            <path
                d="M 50 25 A 1 1 0 0 0 0 25 A 20 20 0 0 0 9 41 A 15 15 0 0 1 18 52 L 32 52 A 15 15 0 0 1 41 41 A 20 20 0 0 0 50 25"
                fill={col}
                stroke={col}
                fillOpacity="50%"
                strokeWidth="3"
            />
            <rect
                x="17"
                y="54"
                width="16"
                height="18"
                fill="white"
                stroke="#bbb"
                strokeWidth="2"
            />
        </svg>
    )
}
