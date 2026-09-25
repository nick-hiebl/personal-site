import type { WashingDry, WashingIron, WashingSpecial, WashingTemp } from '../types'

export type WashSymbol = WashingDry | WashingIron | WashingSpecial | WashingTemp

type Props = {
    symbol: WashSymbol | 'blank'
    background?: boolean
}

const COMMON_SYMBOL = {
    stroke: 'black',
    strokeWidth: '7',
    strokeLinecap: 'round' as const,
    fill: 'transparent',
}

type DotTemp = `dot-${1 | 2 | 3 | 4 | 5 | 6}`

const TEMP_CIRCLE_COORDS: Record<DotTemp, { x: number, y: number }[]> = {
    'dot-1': [
        { x: 50, y: 55 },
    ],
    'dot-2': [
        { x: 41, y: 55 },
        { x: 59, y: 55 },
    ],
    'dot-3': [
        { x: 32, y: 55 },
        { x: 50, y: 55 },
        { x: 68, y: 55 },
    ],
    'dot-4': [
        { x: 41, y: 46 },
        { x: 59, y: 46 },
        { x: 41, y: 64 },
        { x: 59, y: 64 },
    ],
    'dot-5': [
        { x: 32, y: 46 },
        { x: 50, y: 46 },
        { x: 68, y: 46 },
        { x: 41, y: 64 },
        { x: 59, y: 64 },
    ],
    'dot-6': [
        { x: 32, y: 46 },
        { x: 50, y: 46 },
        { x: 68, y: 46 },
        { x: 32, y: 64 },
        { x: 50, y: 64 },
        { x: 68, y: 64 },
    ],
}

export const WashingSymbol = ({ symbol, background }: Props) => {
    if (symbol === 'blank') {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="2 2 96 96"
                width="50"
            >
                <rect x="15" y="15" width="70" height="70" rx="2" fill="#aaa" />
            </svg>
        )
    } else if (['tumble', 'drip', 'shade', 'flat', 'hang'].includes(symbol)) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="2 2 96 96"
                width="50"
            >
                {background && <rect x="2" y="2" width="96" height="96" rx="10" fill="white" />}
                <rect x="10" y="10" width="80" height="80" rx="2" {...COMMON_SYMBOL} />
                {symbol === 'tumble' && (
                    <circle cx="50" cy="50" r="35" {...COMMON_SYMBOL} />
                )}
                {symbol === 'drip' && (
                    <>
                        <line x1="32" y1="25" x2="32" y2="75" {...COMMON_SYMBOL} />
                        <line x1="50" y1="25" x2="50" y2="75" {...COMMON_SYMBOL} />
                        <line x1="68" y1="25" x2="68" y2="75" {...COMMON_SYMBOL} />
                    </>
                )}
                {symbol === 'shade' && (
                    <>
                        <line x1="32" y1="12" x2="12" y2="32" {...COMMON_SYMBOL} />
                        <line x1="52" y1="12" x2="12" y2="52" {...COMMON_SYMBOL} />
                    </>
                )}
                {symbol === 'flat' && (
                    <line x1="25" y1="50" x2="75" y2="50" {...COMMON_SYMBOL} />
                )}
                {symbol === 'hang' && (
                    <path
                        d="M 10 10 Q 50 50 90 10"
                        {...COMMON_SYMBOL}
                    />
                )}
            </svg>
        )
    } else if (['low', 'medium', 'high', 'no'].includes(symbol)) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="2 2 96 96"
                width="50"
            >
                {background && <rect x="2" y="2" width="96" height="96" rx="10" fill="white" />}
                <path
                    d="
                        M 30 20 L 90 20 L 90 80 L 10 80 Q 0 30 90 40
                    "
                    {...COMMON_SYMBOL}
                />
                {symbol === 'low' && (
                    <circle cx="52" cy="60" r="6" fill="black" />
                )}
                {symbol === 'medium' && (
                    <>
                        <circle cx="44" cy="60" r="6" fill="black" />
                        <circle cx="60" cy="60" r="6" fill="black" />
                    </>
                )}
                {symbol === 'high' && (
                    <>
                        <circle cx="36" cy="60" r="6" fill="black" />
                        <circle cx="52" cy="60" r="6" fill="black" />
                        <circle cx="68" cy="60" r="6" fill="black" />
                    </>
                )}
                {symbol === 'no' && (
                    <>
                        <line x1="10" y1="30" x2="90" y2="70" {...COMMON_SYMBOL} stroke="white" strokeWidth="10" />
                        <line x1="10" y1="70" x2="90" y2="30" {...COMMON_SYMBOL} stroke="white" strokeWidth="10" />
                        <line x1="10" y1="70" x2="90" y2="30" {...COMMON_SYMBOL} strokeWidth="6" />
                        <line x1="10" y1="30" x2="90" y2="70" {...COMMON_SYMBOL} strokeWidth="6" />
                    </>
                )}
            </svg>
        )
    } else if (symbol === 'non-chlorine-bleach') {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="2 2 96 96"
                width="50"
            >
                {background && <rect x="2" y="2" width="96" height="96" rx="10" fill="white" />}
                <path
                    d="
                        M 50 13 L 90 87 L 10 87 Z
                        M 62 34 L 32 87
                        M 72 55 L 55 87
                    "
                    {...COMMON_SYMBOL}
                />
            </svg>
        )
    } else if (symbol === 'dry-clean') {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="2 2 96 96"
                width="50"
            >
                {background && <rect x="2" y="2" width="96" height="96" rx="10" fill="white" />}
                <circle cx="50" cy="50" r="30" {...COMMON_SYMBOL} />
            </svg>
        )
    } else if (symbol.startsWith('dot-') || ['30', '40', '50', '60', '70', '95'].includes(symbol)) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="2 2 96 96"
                width="50"
            >
                {background && <rect x="2" y="2" width="96" height="96" rx="10" fill="white" />}
                <path
                    d="
                        M 10 20 L 20 80 L 80 80 L 90 20
                        M 12 30 L 17 25 L 22 25 L 27 30 L 32 30 L 37 25 L 42 25 L 47 30 L 52 30 L 57 25 L 62 25 L 67 30 L 72 30 L 77 25 L 82 25 L 87 30
                    "
                    stroke="black"
                    strokeLinecap="round"
                    strokeWidth="5"
                    fill="transparent"
                />
                {symbol.startsWith('dot-') ? (
                    <>
                        {TEMP_CIRCLE_COORDS[symbol as DotTemp]?.map(({ x, y }) => (
                            <circle cx={x} cy={y} r="7" fill="black" />
                        )) ?? null}
                    </>
                ) : (
                    <text
                        x="53"
                        y="65"
                        textAnchor="middle"
                        className="washing-symbol-text"
                        fontSize="2em"
                        fontWeight="bold"
                    >
                        {symbol}°
                    </text>
                )}
            </svg>
        )
    }

    return symbol
}
