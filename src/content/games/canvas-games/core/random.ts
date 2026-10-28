export const randInt = (lo: number, hi: number): number => {
    return Math.floor(lo + Math.random() * (hi - lo))
}

export const randomChoice = <T>(items: T[]): T => {
    return items[randInt(0, items.length)]
}