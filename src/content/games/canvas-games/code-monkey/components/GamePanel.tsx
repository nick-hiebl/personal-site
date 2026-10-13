import { useSyncExternalStore } from 'react'
import type { MonkeyGame } from '../game'

type Props = {
    game: MonkeyGame
}

export const GamePanel = ({ game }: Props) => {
    const { bananas, oranges } = useSyncExternalStore(game.fruitsStore.subscribe, game.fruitsStore.getSnapshot)

    return (
        <div className="column gap-16px">
            <div className="row-center gap-16px">
                <div>Bananas: {bananas}</div>
                <div>Oranges: {oranges}</div>
            </div>
            <canvas
                width="800"
                height="600"
                ref={(canvas) => {
                    if (!canvas) {
                        return
                    }

                    game.setCanvas(canvas)
                }}
                style={{
                    width: '800px',
                    height: '600px',
                    border: '1px solid var(--color-border)',
                }}
            />
        </div>
    )
}