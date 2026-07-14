import type { EdgeRule, PuzzleStateValue } from './types'

export const validateEdgeRule = (edgeRule: EdgeRule, data: PuzzleStateValue[]): boolean => {
    if (!edgeRule) {
        return true
    }

    if (edgeRule.type === 'count') {
        return data.reduce((sum, cell) => sum + (!!cell ? 1 : 0), 0) === edgeRule.count
    } else if (edgeRule.type === 'groups') {
        return data.reduce(({ groups, inGroup }, cell) => ({
            groups: groups + (!!cell && !inGroup ? 1 : 0),
            inGroup: !!cell,
        }), { groups: 0, inGroup: false }).groups === edgeRule.count
    } else if (edgeRule.type === 'inverted-groups') {
        return data.reduce(({ groups, inGroup }, cell) => ({
            groups: groups + (!cell && !inGroup ? 1 : 0),
            inGroup: !cell,
        }), { groups: 0, inGroup: false }).groups === edgeRule.count
    } else if (edgeRule.type === 'nonogram') {
        const results = data.reduce(({ groups, currentGroupSize }, cell) => ({
            groups: !cell && currentGroupSize > 0
                ? groups.concat(currentGroupSize)
                : groups,
            currentGroupSize: cell ? currentGroupSize + 1 : 0,
        }), { groups: [] as number[], currentGroupSize: 0 })
        const groups = results.currentGroupSize > 0 ? results.groups.concat(results.currentGroupSize) : results.groups

        return groups.length === edgeRule.groups.length &&
            edgeRule.groups.every((groupSize, index) => groupSize === groups[index])
    } else {
        throw Error('Unknown edge rule type')
    }
}