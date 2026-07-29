type TakuzuIconProps = {
    size?: `${number}px` | `${number}%`
}

export const TakuzuIcon = ({ size }: TakuzuIconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 114 114"
            className={size ? undefined : 'clue-icon'}
            height={size}
            width={size}
        >
            <rect x="30" y="0" width="24" height="24" fill="white" rx="4" ry="4" />
            <rect x="32" y="32" width="20" height="20" fill="transparent" stroke="white" strokeWidth="4" rx="4" ry="4" />
            <rect x="30" y="60" width="24" height="24" fill="white" rx="4" ry="4" />
            <rect x="32" y="92" width="20" height="20" fill="transparent" stroke="white" strokeWidth="4" rx="4" ry="4" />
            <rect x="60" y="0" width="24" height="24" fill="white" rx="4" ry="4" />
            <rect x="62" y="32" width="20" height="20" fill="transparent" stroke="white" strokeWidth="4" rx="4" ry="4" />
            <rect x="62" y="62" width="20" height="20" fill="transparent" stroke="white" strokeWidth="4" rx="4" ry="4" />
            <rect x="60" y="90" width="24" height="24" fill="white" rx="4" ry="4" />
        </svg>
    )
}
