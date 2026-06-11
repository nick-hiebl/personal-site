import React from 'react'

import './Toggle.css'

interface Props {
    onChange: (on: boolean) => void
    value: boolean
    children: React.ReactNode
    id: string
}

export const Toggle = (props: Props) => {
    return (
        <div className="toggle-container">
            <label htmlFor={props.id}>{props.children}</label>
            <div className="switch">
                <input
                    id={props.id}
                    type="checkbox"
                    checked={props.value}
                    onChange={e => props.onChange(e.currentTarget.checked)}
                />
                <label htmlFor={props.id}>
                    <span className="slider" />
                </label>
            </div>
        </div>
    )
}
