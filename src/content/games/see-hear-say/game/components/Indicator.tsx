type Props = {
    enabled: boolean
}

export const Indicator = ({ enabled }: Props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 50"
            width="50"
            height="50"
        >
            <rect
                x="0"
                y="0"
                width="50"
                height="50"
                rx="10"
                ry="10"
                fill="var(--N800)"
            />
            <circle
                cx="25"
                cy="25"
                r="18"
                fill={enabled ? 'white' : 'black'}
            />
        </svg>
    )
}
