import React from 'react'

import './SpoilerWarning.css'

export const SpoilerWarning = () => {
    return (
        <div
            className="grid-game-spoiler-warning column gap-8px"
        >
            <div>
                This page is arguably a spoiler for my "grid game", which may eventually be a puzzle game focused on learning the rules for yourself.
            </div>
            <div>
                If you love games or puzzles with a focus on rule discovery, you may not want to read on.
            </div>
            <div>
                Once I have a playable game supporting a good rule-discovery experience, I will update this warning.
            </div>
        </div>
    )
}
