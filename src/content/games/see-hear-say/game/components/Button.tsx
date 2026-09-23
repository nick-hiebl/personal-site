import type { BaseColor, BlindColor } from '../types'

type Props = {
    color: BaseColor | BlindColor
}

export const ButtonIcon = ({ color }: Props) => {
    const buttonColor = color === 'color' ? 'grey' : color

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-5 0 60 50"
            width="50"
            height="50"
        >
            <ellipse
                cx="25"
                cy="30"
                rx="27"
                ry="11"
                fill="#666"
                stroke="black"
                strokeWidth="2"
            />
            <path
                d="M 7 13 A 18 5 0 0 1 43 13 L 45 30 A 20 6 0 0 1 5 30 Z"
                fill={buttonColor}
                stroke="black"
                strokeWidth="2"
            />
            <ellipse
                cx="25"
                cy="13"
                rx="18"
                ry="5"
                fill={buttonColor}
                stroke="black"
                strokeWidth="2"
            />
        </svg>
    )
}
