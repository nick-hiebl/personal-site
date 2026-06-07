import { useState } from 'react'

import { getStorageSetting, setStorageSetting } from '../../../../../components/common/localStorageUtils'

import './Hint.css'

const HINTS_LOCAL_STORAGE_KEY = 'hide-hints'

export const setHintsEnabled = (enabled: boolean) => {
    setStorageSetting(HINTS_LOCAL_STORAGE_KEY, !enabled)
}

export const getHintsEnabled = () => {
    return !getStorageSetting(HINTS_LOCAL_STORAGE_KEY, false)
}

interface Props {
    children: React.ReactNode
}

export const Hint = ({ children }: Props) => {
    const [hintsEnabled, setState] = useState(getHintsEnabled())

    if (!hintsEnabled) {
        return null
    }

    return (
        <div className="hint">
            <button
                className="hint-close-button"
                onClick={() => {
                    setState(false)
                    setHintsEnabled(false)
                }}
            >
                ✕
            </button>
            {children}
        </div>
    )
}
