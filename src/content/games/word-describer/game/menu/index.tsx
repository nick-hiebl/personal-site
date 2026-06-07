import { useEffect, useState } from 'react'

import { getHintsEnabled, setHintsEnabled } from '../components/Hint.tsx'
import { SetName } from '../components/SetName'
import { Tab, Tabs } from '../components/Tabs'
import { getHideWords, setHideWords } from '../components/WordDisplay'
import { useGameContext } from '../context'

import { AdvancedSettings } from './AdvancedSettings.tsx'
import { GameSettingsMenu } from './GameSettingsMenu.tsx'
import { NonHostGameSettings } from './NonHostGameSettings.tsx'

import './Menu.css'

interface Props {
    isOpen: boolean
    onClose: () => void
    code: string
}

export const Menu = ({ isOpen, onClose, code }: Props) => {
    const [currentTab, setTab] = useState<'personal' | 'game' | 'advanced'>('personal')

    const { output: { players, hostPlayerId, yourId } } = useGameContext()

    const hostPlayer = players.find(player => player.id === hostPlayerId)
    const youAreHost = hostPlayerId === yourId

    useEffect(() => {
        if (isOpen) {
            const onEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose()
                }
            }

            document.addEventListener('keydown', onEscape)

            return () => {
                document.removeEventListener('keydown', onEscape)
            }
        }
    }, [isOpen, onClose])

    return (
        <div id="menu" data-isopen={isOpen}>
            <button id="close-menu-button" onClick={onClose}>✕</button>
            <div className="menu-content column-list">
                <header className="stack gap-8px">
                    <h2>Menu ({ code })</h2>
                    <div>Game hosted by {youAreHost ? 'YOU' : `'${hostPlayer?.name}'`}</div>
                </header>
                <Tabs>
                    <Tab onClick={() => setTab('personal')} selected={currentTab === 'personal'}>Personal</Tab>
                    <Tab onClick={() => setTab('game')} selected={currentTab === 'game'}>Game</Tab>
                    {youAreHost && (
                        <Tab onClick={() => setTab('advanced')} selected={currentTab === 'advanced'}>Advanced</Tab>
                    )}
                </Tabs>
                {isOpen &&
                    (currentTab === 'personal' ? (
                        <PersonalSettings />
                    ) : currentTab === 'advanced' ? (
                        <AdvancedSettings />
                    ) : youAreHost ? (
                        <GameSettingsMenu />
                    ) : (
                        <NonHostGameSettings />
                    ))}
            </div>
        </div>
    )
}

const PersonalSettings = () => (
    <div className="column-list padding-start">
        <SetName />
        <HideWordsSetting />
        <ShowHintsSetting />
    </div>
)

const HideWordsSetting = () => {
    const [enabled, setEnabled] = useState(getHideWords())

    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={e => {
                        setHideWords(e.currentTarget.checked)
                        setEnabled(e.currentTarget.checked)
                    }}
                />
                Hide words until hovered
            </label>
        </div>
    )
}

const ShowHintsSetting = () => {
    const [enabled, setEnabled] = useState(getHintsEnabled())

    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={e => {
                        setHintsEnabled(e.currentTarget.checked)
                        setEnabled(e.currentTarget.checked)
                    }}
                />
                Show game explanation
            </label>
        </div>
    )
}
