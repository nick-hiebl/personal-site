import { useState } from 'react'

import { useGameContext } from '../context'

import './SetName.css'

export const SetName = () => {
    const { output, socket } = useGameContext()

    const defaultName = output.players.find((player) => player.id === output.yourId)?.name

    const [name, setName] = useState(defaultName ?? '')

    const serverSideName = output.players.find(player => player.id === output.yourId)?.name

    return (
        <form onSubmit={formEvent => {
            formEvent.preventDefault()

            const formData = new FormData(formEvent.currentTarget)

            const newName = formData.get('name')
            if (newName && typeof newName === 'string') {
                localStorage.setItem('saved-name', newName)
                socket.emit('updateName', { name: newName })
            }
        }}>
            <div className="gap-line">
                <label htmlFor="name">Name:</label>
                <input id="name" name="name" type="text" onChange={(e) => setName(e.currentTarget.value)} value={name} />
                <button id="update-name-button" type="submit" data-is-matching={serverSideName === name}>Update</button>
            </div>
        </form>
    )
}
