type Props = {
    size: number
}

export const CrossButton = ({ size }: Props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 50"
            width={size}
        >
            <path
                d="M 5 5 L 45 45 M 5 45 L 45 5"
                fill="white"
                strokeLinecap="round"
                strokeWidth="10"
                stroke="black"
            />
        </svg>
    )
}
