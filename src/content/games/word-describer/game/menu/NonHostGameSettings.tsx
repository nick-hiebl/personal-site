import { useGameContext } from '../context'

export const NonHostGameSettings = () => {
    const { output, settings } = useGameContext()

    if (!settings) {
        return (
            <div>Failed to load settings...</div>
        )
    }

    const totalWeights = Object.values(settings.wordListWeights).reduce((sum, now) => sum + now, 0)

    const hasMultipleWordLists = Object.keys(settings.wordListWeights).filter(w => w !== 'default')

    return (
        <div className="stack gap-8px">
            <div className="inline stack-center spread">
                Clues per player
                <span>{settings.cluesPerPlayer}</span>
            </div>
            <strong>
                Readies required after:
            </strong>
            <div className="inline stack-center spread">
                Submitting clues
                <span>{settings.readiesRequired['giving-clues']}</span>
            </div>
            <div className="inline stack-center spread">
                Assessing clues
                <span>{settings.readiesRequired['assessing-clues']}</span>
            </div>
            <div className="inline stack-center spread">
                Between rounds
                <span>{settings.readiesRequired['post-game']}</span>
            </div>
            <strong>Timeout on clues?</strong>
            <span>{settings.cluesTimerEnabled ? 'Yes' : 'No'}</span>
            {settings.cluesTimerEnabled && (
                <div className="inline stack-center spread">
                    Time period to give clues
                    <span>{Math.floor(settings.cluesTimeout / 1_000)} seconds</span>
                </div>
            )}
            {settings.cluesTimerEnabled && (
                <div className="inline stack-center spread">
                    Number of clues required
                    <span>{settings.requiredClues}</span>
                </div>
            )}
            {hasMultipleWordLists ? (
                <div className="stack gap-8px">
                    <strong>Word lists:</strong>
                    {Object.entries(settings.wordListWeights)
                        .map(([key, proportion]) => [key, 100 * proportion / totalWeights] as const)
                        .map(([key, proportion], index, list) => {
                            const prev = list.map(([, weight]) => weight).slice(0, index).reduce((sum, current) => sum + current, 0)
                            const currentProportion = Math.round(prev + proportion) - Math.round(prev)

                            return [key, currentProportion] as const
                        })
                        .map(([key, proportion]) => (
                            <div className="inline stack-center spread" key={key}>
                                {key}
                                <span>{Math.round(proportion)}%</span>
                            </div>
                        ))}
                </div>
            ) : null}
            <div className="inline stack-center">
                <em>Words already seen: {output.seenWords}</em>
            </div>
        </div>
    )
}
