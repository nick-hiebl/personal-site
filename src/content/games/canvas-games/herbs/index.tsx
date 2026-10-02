import { useRef } from 'react'

import { HerbsGame } from './game'

export const Game = () => {
    const gameRef = useRef<HerbsGame>(null)

    return (
        <div className="column-center gap-16px">
            <h1>Herbs game!</h1>
            <canvas
                width="960"
                height="540"
                ref={(canvas) => {
                    if (!canvas) {
                        return
                    }

                    gameRef.current = new HerbsGame(canvas)
                    gameRef.current.start()
                }}
                style={{
                    border: '1px solid orangered',
                    cursor: 'none',
                }}
            />
        </div>
    )
}
