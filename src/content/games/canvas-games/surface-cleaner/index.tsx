import { useRef } from 'react'

import { SurfaceCleanerGame } from './game'

export const Game = () => {
    const gameRef = useRef<SurfaceCleanerGame>(null)

    return (
        <div className="column gap-16px">
            <h1>Surface cleaner</h1>
            <div className="column-center">
                <canvas
                    style={{ width: '1440px', border: '1px solid blue' }}
                    width="1440"
                    height="810"
                    ref={(canvas) => {
                        if (!canvas) {
                            return
                        }

                        gameRef.current = new SurfaceCleanerGame(canvas)
                        console.log(gameRef.current)
                        gameRef.current.start()
                    }}
                />
            </div>
        </div>
    )
}
