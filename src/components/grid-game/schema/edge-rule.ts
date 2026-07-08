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
    } else {
        throw Error('Unknown edge rule type')
    }
}