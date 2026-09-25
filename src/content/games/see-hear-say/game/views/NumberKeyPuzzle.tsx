import { Indicator } from '../components/Indicator'
import { useGameContext } from '../context'
import type { NumberKeyCondition, NumberKeyModule, NumberKeyRule } from '../types'

import './number-key-puzzle.css'

export const NumberKeyPuzzleBlind = ({ puzzle }: { puzzle: NumberKeyModule['blind'] }) => {
    const { socket } = useGameContext()

    return (
        <div className="module column-center gap-16px">
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace" />
                </div>
                <Indicator enabled={puzzle.complete} />
            </div>
            <div className="number-key-grid">
                {puzzle.buttons.map((btn) => (
                    <button
                        key={btn}
                        className="chart-button"
                        onClick={() => {
                            socket.emit('number-key-button', { index: puzzle.index, button: btn })
                        }}
                    >
                        <span className="chart-button-primary">
                            {btn.toLocaleUpperCase()}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}

export const NumberKeyPuzzleDeaf = ({ puzzle }: { puzzle: NumberKeyModule['deaf'] }) => {
    return (
        <div className="module column-center gap-16px">
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace">
                        {puzzle.number}
                    </div>
                </div>
                <Indicator enabled={puzzle.complete} />
            </div>
            <div className="number-key-grid">
                {new Array(4).fill(0).map((_, index) => (
                    <button
                        key={index}
                        className="chart-button"
                        disabled
                    >
                    </button>
                ))}
            </div>
        </div>
    )
}

const NumberKeyPuzzleReference = () => {
    return (
        <div className="module column-center gap-16px">
            <div className="row-center gap-16px spread full-width">
                <div className="chart-display-box-parent row-center">
                    <div className="chart-display-box chart-monospace">
                        00
                    </div>
                </div>
                <Indicator enabled={false} />
            </div>
            <div className="number-key-grid">
                {new Array(4).fill(0).map((_, index) => (
                    <button
                        key={index}
                        className="chart-button"
                        disabled
                    >
                    </button>
                ))}
            </div>
        </div>
    )
}

const NumberKeyRuleComponent = ({ rule }: { rule: NumberKeyRule }) => {
    if (rule.condition.type === 'exact') {
        return (
            <li>
                If the number indicated is equal to {rule.condition.number}, press the button with the label '{rule.button.toLocaleUpperCase()}'
            </li>
        )
    } else if (rule.condition.type === 'prime') {
        return (
            <li>
                If the indicated number is prime, then press the button with the label '{rule.button.toLocaleUpperCase()}'
            </li>
        )
    } else if (rule.condition.type === 'divisible') {
        return (
            <li>
                If the indicated number is divisible by {rule.condition.factor}, then press the button with the label '{rule.button.toLocaleUpperCase()}'
            </li>
        )
    } else if (rule.condition.type === 'between') {
        return (
            <li>
                If the indicated number is between {rule.condition.min} and {rule.condition.max} (inclusive), then press the button with the label '{rule.button.toLocaleUpperCase()}'
            </li>
        )
    } else if (rule.condition.type === 'lt') {
        return (
            <li>
                If the indicated number is less than {rule.condition.number}, then press the button with the label '{rule.button.toLocaleUpperCase()}'
            </li>
        )
    } else if (rule.condition.type === 'gt') {
        return (
            <li>
                If the number indicated is greater than {rule.condition.number}, then press the button with the label '{rule.button.toLocaleUpperCase()}'
            </li>
        )
    } else if (rule.condition.type === 'else') {
        return (
            <li>
                Otherwise, press the button labeled '{rule.button.toLocaleUpperCase()}'
            </li>
        )
    }
}

export const NumberKeyPuzzleRule = ({ rule }: { rule: NumberKeyModule['mute'] }) => {
    return (
        <div className="rule-section column gap-16px">
            <h3>Number key</h3>
            <div>
                Follow the listed rules below in order to perform the first action that applies.
            </div>
            <div>The labels on the buttons are not printed, they are in braille.</div>
            <div>Puzzle looks as below:</div>
            <div className="shrink-module">
                <NumberKeyPuzzleReference />
            </div>
            <ol>
                {rule.rules.map((rule, index) => <NumberKeyRuleComponent key={index} rule={rule} />)}
            </ol>
        </div>
    )
}
