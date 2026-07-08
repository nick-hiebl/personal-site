import { useMemo } from 'react'

import { validateEdgeRule } from './schema/edge-rule'
import type { EdgeRule, PuzzleState } from './schema/types'

type Props = {
    rule: EdgeRule
    mode: 'horizontal' | 'vertical'
    state: PuzzleState
    index: number
}

export const EdgeRuleComponent = ({ index, mode, rule, state }: Props) => {
    if (!rule) {
        return <div />
    }

    const className = mode === 'horizontal' ? 'horizontal-edge-rule' : 'vertical-edge-rule'

    const relevantData = mode === 'horizontal'
        ? state.values[index]
        : state.values.map(row => row[index])

    const isValid = useMemo(() => validateEdgeRule(rule, relevantData), [rule, relevantData])

    if (rule.type === 'count') {
        return (
            <div data-valid={isValid} className={className}>
                <span className="lozenge">
                    {rule.count}
                </span>
            </div>
        )
    }

    return <div>idk</div>
}
