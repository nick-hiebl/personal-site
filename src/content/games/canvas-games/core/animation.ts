export const lerp = (t: number, a: number, b: number): number => {
    return (1 - t) * a + t * b
}
