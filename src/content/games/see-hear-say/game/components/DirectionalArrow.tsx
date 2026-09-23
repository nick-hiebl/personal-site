import type { Direction } from '../types'

import './directional-arrow.css'

type Props = {
    direction: Direction
}

export const DirectionalArrow = ({ direction }: Props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 50"
            width="50"
            height="50"
            className={`directional-arrow directional-arrow-${direction}`}
        >
            <path
                d="M 40 25 L 10 10 L 10 40 Z"
                fill="white"
                strokeLinecap="round"
                strokeWidth="10"
                stroke="black"
            />
            <path
                d="M 40 25 L 10 10 L 10 40 Z"
                fill="white"
                strokeLinecap="round"
                strokeWidth="5"
                stroke="white"
            />
        </svg>
    )
}
