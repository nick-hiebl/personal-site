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
    } else if (edgeRule.type === 'takuzu') {
        const trueCount = data.reduce((c, value) => c + (value ? 1 : 0), 0)
        return trueCount >= Math.floor(data.length / 2) &&
            trueCount <= Math.ceil(data.length / 2) &&
            data.reduce<{ groupSize: number, groupType: boolean, invalid: boolean }>(
                ({ groupSize, groupType, invalid }, value) => !!value === groupType
                    ? { groupSize: groupSize + 1, groupType, invalid: invalid || groupSize + 1 >= 3 }
                    : { groupSize: 1, groupType: !!value, invalid },
                { groupSize: 0, groupType: false, invalid: false }
            ).invalid === false
    } else {
        throw Error('Unknown edge rule type')
    }
}