import { useState } from 'react'

import { PlayerList } from '../components/PlayerList'
import { useGameContext } from '../context'
import type { Prompt, Target } from '../types'

const TARGET_EXPLANATIONS: Record<Target, (prompt: Prompt) => string> = {
    bottom: (prompt) => `Describe the ${prompt.low}`,
    top: (prompt) => `Describe the ${prompt.high}`,
    middle: (prompt) => `Describe something between the ${prompt.low} and the ${prompt.high}`,
    divisive: (prompt) => `Describe something that some consider the ${prompt.low} and some consider the ${prompt.high}`,
}

export const Submitting = () => {
    const { output, socket } = useGameContext()
    const [input, setInput] = useState('')

    if (output.state.state !== 'submitting') {
        return null
    }

    return (
        <div className="stack gap-8px">
            <PlayerList />
            <h2>{output.state.prompt.promptText}</h2>
            {output.state.target && (
                <p>{TARGET_EXPLANATIONS[output.state.target](output.state.prompt)}</p>
            )}
            <form onSubmit={formEvent => {
                formEvent.preventDefault()

                const formData = new FormData(formEvent.currentTarget)

                const inputValue = formData.get('fill-blank-input')
                if (inputValue && typeof inputValue === 'string') {
                    socket.emit('submit', { submission: inputValue })
                }
            }}>
                <input
                    id="fill-blank-input"
                    name="fill-blank-input"
                    type="text"
                    onChange={(e) => setInput(e.currentTarget.value)}
                    value={input}
                    autoComplete="off"
                    autoCapitalize="off"
                />
                <button
                    id="fill-blank-submit"
                    type="submit"
                >
                    Submit
                </button>
            </form>
            <pre>{JSON.stringify(output, null, 2)}</pre>
        </div>
    )
}
