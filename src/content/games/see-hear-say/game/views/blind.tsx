import { Indicator } from '../components/Indicator'
import { LightBulb } from '../components/LightBulb'
import { Wire } from '../components/Wire'
import { useGameContext } from '../context'
import type { Module, WireModule } from '../types'

export const BlindView = () => {
    const { output } = useGameContext()

    if (output.state.state !== 'blind') {
        return null
    }

    return (
        <section className="column gap-8px">
            <h2>You are blind!</h2>
            {output.state.data.map((puzzle, index) => (
                <BlindPuzzle puzzle={puzzle} key={index} />
            ))}
        </section>
    )
}

const BlindPuzzle = ({ puzzle }: { puzzle: Module['blind'] }) => {
    if (puzzle.id === 'wire') {
        return <WirePuzzle puzzle={puzzle} />
    }

    return <span>Unknown puzzle type!</span>
}

const WirePuzzle = ({ puzzle }: { puzzle: WireModule['blind'] }) => {
    const { socket } = useGameContext()

    return (
        <div className="row gap-8px">
            <div className="row gap-8px">
                {puzzle.wires.map((w, index) => (
                    <button
                        key={index}
                        disabled={puzzle.cut[index]}
                        onClick={() => {
                            socket.emit('cut', { index: puzzle.index, wireIndex: index })
                        }}
                    >
                        <Wire color={w} cut={puzzle.cut[index]} />
                    </button>
                ))}
            </div>
            <div className="column-center gap-16px">
                <LightBulb color={puzzle.light} />
                <Indicator enabled={puzzle.complete} />
            </div>
        </div>
    )
}
