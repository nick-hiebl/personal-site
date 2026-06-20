import type { ActiveOutput, CompleteOutput, GameStateOutput, ItemTrigger, PendingGameState } from '../types'

const getTriggerSortKey = (trigger: ItemTrigger) => {
    if (trigger.type === 'immediate') {
        return 0
    } else if (trigger.type === 'yellow-all' || trigger.type === 'yellow-some') {
        return 10_000
    } else {
        return trigger.value
    }
}

const formatState = (state: PendingGameState | ActiveOutput | CompleteOutput): PendingGameState | ActiveOutput | CompleteOutput => {
    if (state.state === 'active' || state.state === 'complete') {
        const valueDetails = state.valueDetails.slice()
        valueDetails.sort((detail, detail2) => detail.value - detail2.value)

        const grids = state.grids.slice()
        grids.sort((grid, grid2) => grid.ownerId.localeCompare(grid2.ownerId))

        const itemsToSort = state.items.slice().map(item => ({ item, sortKey: getTriggerSortKey(item.unlock) }))
        itemsToSort.sort((item, item2) => item.sortKey - item2.sortKey)
        const items = itemsToSort.map(({ item }) => item)

        if (state.state === 'active') {
            return {
                state: 'active',
                valueDetails,
                grids,
                totalReds: state.totalReds,
                totalYellows: state.totalYellows,
                action: state.action,
                errors: state.errors,
                items,
            }
        } else {
            return {
                state: 'complete',
                valueDetails,
                grids,
                totalReds: state.totalReds,
                totalYellows: state.totalYellows,
                errors: state.errors,
                items,
            }
        }
    } else {
        return state
    }
}

export const formatData = ({ players, state, ...rest }: GameStateOutput): GameStateOutput => {
    const sortedPlayers = players.slice()
    sortedPlayers.sort((p1, p2) => p1.id.localeCompare(p2.id))

    return {
        players: sortedPlayers,
        state: formatState(state),
        ...rest,
    }
}
