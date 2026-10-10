import { useEffect, useRef, useState } from 'react'

import Editor, { useMonaco } from '@monaco-editor/react'

import { getLightOrDarkMode, ThemeSwitcher } from '../../../../components/ThemeSwitcher'

import { MonkeyGame } from './game'
import { parseProgram, parseText, type ProgramTree } from './parser'
import { executeProgram } from './parser/executor'

const LS_KEY = 'code-monkey:code'

export const Game = () => {
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
    const [isValid, setIsValid] = useState(true)
    const [program, setProgram] = useState<ProgramTree | undefined>(undefined)

    useEffect(() => {
        game.start()
    }, [game])

    return (
        <div className="column-center gap-16px">
            <h1>Code monkey!</h1>
            <div
                className="row-center gap-16px"
                style={{
                    width: 'calc(100vw - 16px)',
                    boxSizing: 'border-box',
                    paddingInline: '8px',
                }}
            >
                <canvas
                    width="800"
                    height="600"
                    ref={(canvas) => {
                        if (!canvas) {
                            return
                        }

                        // gameRef.current = new HerbsGame(canvas)
                        // gameRef.current.start()
                        game.setCanvas(canvas)
                    }}
                    style={{
                        width: '800px',
                        height: '600px',
                        border: '1px solid orangered',
                    }}
                />
                <div className="column gap-16px" style={{ width: '100%' }}>
                    <div className="row-center gap-8px">
                        <button
                            onClick={() => {
                                localStorage.setItem(LS_KEY, codeState)

                                if (monaco) {
                                    const tokens = monaco.editor.tokenize(codeState, 'python')

                                    const lines = (codeState).split('\n')

                                    try {
                                        const linedTokens = tokens
                                            .flatMap((tokenList, index) => tokenList.map(token => ({ text: '', ...token, lineNumber: index })))

                                        const textTokens = linedTokens
                                            .map((token, index, arr) => ({ ...token, text: parseText(lines, token, arr[index + 1]) ?? '' }))

                                        const filteredTokens = textTokens
                                            .filter(token => token.type !== 'white.python' && token.type !== 'comment.python')

                                        const p1 = parseProgram(filteredTokens)

                                        setProgram(p1)
                                    } catch (error) {
                                        console.error(error)
                                        setProgram(undefined)
                                    }
                                }
                            }}
                        >
                            Save
                        </button>
                        <button
                            disabled={running}
                            onClick={async () => {
                                if (cancelRef.current) {
                                    cancelRef.current()
                                }

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
                                        // if (monkeyId !== undefined) {
                                        //     game.removeMonkey(monkeyId)
                                        // }
                                    }
                                }
                            }}
                        >
                            Run
                        </button>
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
                        {isValid ? 'Valid' : 'Invalid'}
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
                        onValidate={(markers) => {
                            setIsValid(markers.length === 0)
                        }}
                    />
                </div>
            </div>
            <ThemeSwitcher />
        </div>
    )
}
