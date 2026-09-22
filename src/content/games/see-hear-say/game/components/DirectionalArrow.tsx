import type { Direction } from '../types'

type Props = {
    direction: Direction
}

const rotation: Record<Direction, string> = {
    right: '0',
    down: '90',
    left: '180',
    up: '270',
}

export const DirectionalArrow = ({ direction }: Props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 50"
            width="50"
            height="50"
        >
            <path
                d="M 40 25 L 10 10 L 10 40 Z"
                fill="white"
                strokeLinecap="round"
                strokeWidth="10"
                stroke="black"
                transform={`rotate(${rotation[direction]}, 25, 25)`}
            />
            <path
                d="M 40 25 L 10 10 L 10 40 Z"
                fill="white"
                strokeLinecap="round"
                strokeWidth="5"
                stroke="white"
                transform={`rotate(${rotation[direction]}, 25, 25)`}
            />
        </svg>
    )
}
