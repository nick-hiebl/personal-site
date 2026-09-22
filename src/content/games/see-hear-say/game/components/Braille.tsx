type DigitProps = {
    digit: number
}

const DIGITS = [
    '⠚', // 0
    '⠁', // 1
    '⠃', // 2
    '⠉', // 3
    '⠙', // 4
    '⠑', // 5
    '⠋', // 6
    '⠛', // 7
    '⠓', // 8
    '⠊', // 9
]

export const BrailleDigit = ({ digit }: DigitProps) => {
    return <span>{DIGITS[digit] ?? DIGITS[0]}</span>
}