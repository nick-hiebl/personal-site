import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import Editor, { useMonaco } from '@monaco-editor/react'

import { getLightOrDarkMode, ThemeSwitcher } from '../../../../components/ThemeSwitcher'

import { GamePanel } from './components/GamePanel'
import { MonkeyGame } from './game'
import { parseProgram, parseText, type ProgramTree } from './parser'
import { executeProgram } from './parser/executor'
import { Tabs } from './components/Tabs'
import { Documentation } from './components/Documentation'

const LS_KEY = 'code-monkey:code'

export const Game = () => {
    const [speed, setSpeed] = useState(1)
    const [game] = useState(() => new MonkeyGame())
    const cancelRef = useRef<() => void>(undefined)
    const [running, setRunning] = useState(false)

    const monaco = useMonaco()
    const [codeState, setCodeState] = useState(() => {
        const loaded = localStorage.getItem(LS_KEY)
        if (loaded) {
            return loaded
        }

        return '# Comment'
    })
    const [program, setProgram] = useState<ProgramTree | undefined>(undefined)

    useEffect(() => {
        game.start()
    }, [game])

    const onSave = () => {
        localStorage.setItem(LS_KEY, codeState)

        if (monaco) {
            const tokens = monaco.editor.tokenize(codeState, 'python')

            const lines = (codeState).split('\n')

            try {
                const linedTokens = tokens
                    .flatMap((tokenList, index) => tokenList.map(token => ({ text: '', ...token, lineNumber: index })))

                const textTokens = linedTokens
                    .map((token, index, arr) => ({ ...token, text: parseText(lines, token, arr[index + 1]) ?? '' }))

                // Splitting parenthesis otherwise they can be grouped in bizarre ways according to spacing, e.g.
                // '())' which is difficult to process later on
                const splitTokens = textTokens
                    .flatMap(token =>
                        token.type === 'delimiter.parenthesis.python'
                            ? Array.from(token.text).map((char, index) => ({
                                ...token,
                                text: char,
                                offset: token.offset + index,
                            }))
                            : token,
                    )

                const filteredTokens = splitTokens
                    .filter(token => token.type !== 'white.python' && token.type !== 'comment.python');

                (window as any).__RAW_TOKENS__ = textTokens;
                (window as any).__TOKENS__ = filteredTokens

                const p1 = parseProgram(filteredTokens)

                setProgram(p1)
            } catch (error) {
                console.error(error)
                setProgram(undefined)
            }
        }
    }

    const onRun = async () => {
        if (cancelRef.current) {
            cancelRef.current()
        }
        
        onSave()

        if (program) {
            game.monkeys.clear()

            let monkeyId
            try {
                setRunning(true)
                monkeyId = game.createMonkey()

                const handle = executeProgram(program, game, monkeyId)

                cancelRef.current = handle.cancel

                await handle.promise
                setRunning(false)
            } catch (error) {
                setRunning(false)
                if (error instanceof Error && error.message === 'Cancelled') {
                    // Do nothing
                } else {
                    console.warn('Caught the following error from executing program', error)
                }
            } finally {
                // We don't do anything on program end or crash currently
            }
        }
    }

    return (
        <div className="column-center gap-16px">
            <h1>Code monkey!</h1>
            <div
                className="row gap-16px"
                style={{
                    width: 'calc(100vw - 16px)',
                    boxSizing: 'border-box',
                    paddingInline: '8px',
                }}
            >
                <div style={{ width: '800px', flexShrink: 0, flexGrow: 0 }}>
                    <Tabs
                        tabs={[
                            { id: 'game', label: 'Game', content: <GamePanel game={game} /> },
                            { id: 'docs', label: 'Documentation', content: <Documentation /> },
                        ]}
                    />
                </div>
                <div className="column gap-16px" style={{ width: '100%' }}>
                    <div className="row-center gap-8px">
                        <button onClick={onSave}>Save</button>
                        <button disabled={running} onClick={onRun}>Run</button>
                        <button
                            disabled={!running}
                            onClick={() => {
                                if (cancelRef.current) {
                                    cancelRef.current()
                                    setRunning(false)
                                }
                            }}
                        >
                            Stop
                        </button>
                        <span>Speed:</span>
                        {[1, 2, 5, 10, 25, 100].map((speedMulti) => (
                            <button
                                key={speedMulti}
                                disabled={speed === speedMulti}
                                onClick={() => {
                                    game.speedMulti = speedMulti
                                    setSpeed(speedMulti)
                                }}
                            >
                                {speedMulti}x
                            </button>
                        ))}
                    </div>
                    <Editor
                        onChange={(value) => {
                            setCodeState(value ?? '')
                        }}
                        theme={getLightOrDarkMode() === 'light' ? 'light' : 'vs-dark'}
                        height="70vh"
                        width="100%"
                        defaultLanguage="python"
                        defaultValue={codeState}
                    />
                </div>
            </div>
            <ThemeSwitcher />
        </div>
    )
}
