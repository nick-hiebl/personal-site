import { useRef } from 'react'

import { SlingGame } from './game'

export const Game = () => {
    const gameRef = useRef<SlingGame>(null)

    return (
        <div className="column-center gap-16px">
            <h1>Sling game!</h1>
            <canvas
                width="600"
                height="600"
                ref={(canvas) => {
                    if (!canvas) {
                        return
                    }

                    gameRef.current = new SlingGame(canvas)
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
