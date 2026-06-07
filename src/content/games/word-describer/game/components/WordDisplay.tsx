import { useState } from 'react'

import { getStorageSetting, setStorageSetting } from '../../../../../components/common/localStorageUtils'
import { useGameContext } from '../context'

import './WordDisplay.css'

interface Props {
    theWord: string
    shouldShow: boolean
}

const HIDE_WORDS_LOCAL_STORAGE_KEY = 'hide-words'

export const getHideWords = () => {
    return getStorageSetting(HIDE_WORDS_LOCAL_STORAGE_KEY, false)
}

export const setHideWords = (enabled: boolean) => {
    setStorageSetting(HIDE_WORDS_LOCAL_STORAGE_KEY, enabled)
}

export const WordDisplay = (props: Omit<Props, 'shouldShow'>) => {
    const [hovered, setHovered] = useState(false)

    const { output } = useGameContext()

    const guesserId = 'guesserId' in output.state ? output.state.guesserId : undefined
    const guesser = output.players.find(player => player.id === guesserId)

    return (
        <div
            id="word-selection-region"
            onTouchStart={() => setHovered(true)}
            onTouchEnd={() => setHovered(false)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div>The word is:</div>
            <SecretWord {...props} shouldShow={hovered} />
            <div>'{guesser?.name}' {output.state.state === 'guessing' ? 'is' : 'will be'} trying to guess</div>
        </div>
    )
}

const SecretWord = ({ shouldShow, theWord }: Props) => {
    if (getHideWords()) {
        return (
            <div className="big-text secret-word-hidden" data-revealed={shouldShow}>
                <span>{shouldShow ? theWord : '[Hover to reveal]'}</span>
            </div>
        )
    }

    return (
        <div className="big-text">{theWord}</div>
    )
}
