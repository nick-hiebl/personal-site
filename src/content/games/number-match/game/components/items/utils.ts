import { useGameContext } from '../../context'
import type { Item } from '../../types'

export const useItemUnlocked = (item: Item): boolean => {
    const { output: { state } } = useGameContext()

    const trigger = item.unlock

    if (state.state === 'pending') {
        return false
    }

    if (trigger.type === 'immediate') {
        return true
    }

    const allValues = state.grids.flatMap(grid => grid.values).flatMap(values => values)

    const yellowValueSet = new Set(state.valueDetails.filter(v => v.isYellow).map(v => v.value))

    if (trigger.type === 'yellow-all') {
        return allValues.every(({ revealed, value }) => revealed || (value && !yellowValueSet.has(value)))
    } else if (trigger.type === 'yellow-some') {
        return allValues.some(({ revealed, value }) => revealed && (value && yellowValueSet.has(value)))
    } else if (trigger.type === 'value-all') {
        return allValues.every(({ revealed, value }) => revealed || value !== trigger.value)
    } else if (trigger.type === 'value-some') {
        return allValues.some(({ revealed, value }) => revealed && value === trigger.value)
    }

    return false
}