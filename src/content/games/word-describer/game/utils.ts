import type { Output } from './types'

export const idOfGuesser = (state: Output): string => {
    if (state.state.state === 'pending') {
        return ''
    }

    return state.state.guesserId
}
