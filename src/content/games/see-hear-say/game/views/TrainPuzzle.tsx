import type { JSX } from 'astro/jsx-runtime'
import { CrossButton } from '../components/CommonSymbols'
import { DirectionalArrow } from '../components/DirectionalArrow'
import { Indicator } from '../components/Indicator'
import { useGameContext } from '../context'
import type { TrainLine, TrainModule } from '../types'

export const TrainPuzzleBlind = ({ puzzle }: { puzzle: TrainModule['blind'] }) => {
    const { socket } = useGameContext()

    return (
        <div className="module column-center gap-16px">
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace">
                        {puzzle.departure}
                    </div>
                </div>
                <Indicator enabled={puzzle.complete} />
            </div>
            {puzzle.lines.map((line, index) => (
                <div key={index} className="row-center justify-center gap-16px full-width">
                    <button
                        onClick={() => {
                            socket.emit('train-step', {
                                index: puzzle.index,
                                stepRow: index,
                                reset: true,
                            })
                        }}
                        className="no-text"
                        style={{ padding: '8px' }}
                    >
                        <CrossButton size={36} />
                    </button>
                    <div className="chart-display-box chart-monospace">
                        {line}
                    </div>
                    <button
                        onClick={() => {
                            socket.emit('train-step', {
                                index: puzzle.index,
                                stepRow: index,
                            })
                        }}
                    >
                        <DirectionalArrow direction="right" />
                    </button>
                </div>
            ))}
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace">
                        {puzzle.destination}
                    </div>
                </div>
            </div>
            <button
                onClick={() => {
                    socket.emit('train-submit', { index: puzzle.index })
                }}
                className="chart-big-button"
                style={{ minWidth: '300px' }}
            />
        </div>
    )
}

const TRAIN_LINE_NAMES: Record<TrainLine, { text: string, color: string }> = {
    T1: {
        text: 'North Shore & Western Line',
        color: '#F89C1C',
    },
    T2: {
        text: 'Leppington & Inner West Line',
        color: '#0097CD',
    },
    T3: {
        text: 'Liverpool & Inner West Line',
        color: '#F36E21',
    },
    T4: {
        text: 'Eastern Suburbs & Illawarra Line',
        color: '#015AA5',
    },
    T5: {
        text: 'Cumberland Line',
        color: '#C32190',
    },
    T6: {
        text: 'Lidcombe & Bankstown Line',
        color: '#7C3D1F',
    },
    T7: {
        text: 'Olympic Park Line',
        color: '#6E818E',
    },
    T8: {
        text: 'Airport & South Line',
        color: '#00964C',
    },
    T9: {
        text: 'Northern Line',
        color: '#D21F2F',
    },
    M1: {
        text: 'Metro North West & Bankstown Line',
        color: '#00959A',
    },
}

export const TrainPuzzleDeaf = ({ puzzle }: { puzzle: TrainModule['blind'] }) => {
    return (
        <div className="module column-center gap-16px">
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace">
                        {puzzle.departure}
                    </div>
                </div>
                <Indicator enabled={puzzle.complete} />
            </div>
            {puzzle.lines.map((line, index) => (
                <div key={index} className="row-center justify-center gap-16px full-width">
                    <button
                        disabled
                        className="no-text"
                        style={{ padding: '8px' }}
                    >
                        <CrossButton size={36} />
                    </button>
                    <div className="chart-display-box row-center justify-center">
                        {line && (
                            <span
                                style={{
                                    backgroundColor: TRAIN_LINE_NAMES[line].color,
                                    padding: '2px 10px',
                                    borderRadius: '8px',
                                    fontFamily: 'sans-serif',
                                }}
                            >
                                {TRAIN_LINE_NAMES[line].text}
                            </span>
                        )}
                    </div>
                    <button disabled>
                        <DirectionalArrow direction="right" />
                    </button>
                </div>
            ))}
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace">
                        {puzzle.destination}
                    </div>
                </div>
            </div>
            <button
                disabled
                className="chart-big-button"
                style={{ minWidth: '300px' }}
            >
                TRAVEL
            </button>
        </div>
    )
}

const TrainPuzzleReference = () => {
    return (
        <div className="module column-center gap-16px">
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace" />
                </div>
                <Indicator enabled={false} />
            </div>
            {new Array(3).fill(0).map((_, index) => (
                <div key={index} className="row-center justify-center gap-16px full-width">
                    <button
                        disabled
                        className="no-text"
                        style={{ padding: '8px' }}
                    >
                        <CrossButton size={36} />
                    </button>
                    <div className="chart-display-box row-center justify-center" />
                    <button disabled>
                        <DirectionalArrow direction="right" />
                    </button>
                </div>
            ))}
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace" />
                </div>
            </div>
            <button
                disabled
                className="chart-big-button"
                style={{ minWidth: '300px' }}
            >
                TRAVEL
            </button>
        </div>
    )
}

export const TrainPuzzleRule = ({ rule }: { rule: TrainModule['mute'] }) => {
    return (
        <div className="rule-section column gap-16px">
            <h3>Train</h3>
            <div>
                Determine a route of up to 3 lines to get from the departure station to the
                destination station.
            </div>
            <div>Puzzle looks as below:</div>
            <div className="shrink-module">
                <TrainPuzzleReference />
            </div>
            <div>
                A train map can be found at <a target="_blank" href="https://transportnsw.info/sydney-trains-network-map">https://transportnsw.info/sydney-trains-network-map</a>
            </div>
            <div>
                Be warned, the following train lines are out of order:
            </div>
            <ul className="list">
                {rule.bannedLines.map(line => (
                    <li key={line} className="list-item">{line}</li>
                ))}
            </ul>
            <div>
                And trains will not be stopping at the following stations:
            </div>
            <ul className="list">
                {rule.bannedStations.map(station => (
                    <li key={station} className="list-item">{station}</li>
                ))}
            </ul>
        </div>
    )
}
