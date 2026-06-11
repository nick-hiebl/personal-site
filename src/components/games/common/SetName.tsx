import { useState } from 'react'

import './SetName.css'

type SetNameProps = {
    currentName?: string
    onSetName: (newName: string) => void
}

export const SetName = ({ currentName, onSetName }: SetNameProps) => {
    const [name, setName] = useState(currentName ?? '')

    return (
        <form onSubmit={formEvent => {
            formEvent.preventDefault()

            const formData = new FormData(formEvent.currentTarget)

            const newName = formData.get('name')
            if (newName && typeof newName === 'string') {
                localStorage.setItem('saved-name', newName)
                onSetName(newName)
            }
        }}>
            <div className="gap-line">
                <label htmlFor="name">Name:</label>
                <input id="name" name="name" type="text" onChange={(e) => setName(e.currentTarget.value)} value={name} />
                <button id="update-name-button" type="submit" data-is-matching={currentName === name}>Update</button>
            </div>
        </form>
    )
}
