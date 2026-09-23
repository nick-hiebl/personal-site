import type { Symbol } from '../types'

type Props = {
    symbol: Symbol
}

const SYMBOL_MAP: Record<Symbol, string> = {
    'a': '₻',
    'b': '₡',
    'c': '₢',
    'd': '₣',
    'e': '₾',
    'f': '₺',
    'g': '₪',
    'h': '₮',
    'i': '₸',
    'j': '₰',
}

export const SymbolComponent = ({ symbol }: Props) => {
    return <span>{SYMBOL_MAP[symbol] ?? symbol}</span>
}
