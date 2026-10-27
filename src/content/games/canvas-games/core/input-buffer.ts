export type InputBuffer = (isPressed: boolean) => void

export const inputBuffer = (onPress: () => void, onRelease?: () => void) => {
    let state = false

    return (isPressed: boolean) => {
        if (isPressed && !state) {
            onPress()
        }
        if (!isPressed && state) {
            onRelease?.()
        }

        state = isPressed
    }
}
