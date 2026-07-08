import { validateEdgeRule } from './edge-rule'
import type { PuzzleSchema, PuzzleState } from './types'

export const isCorrect = (schema: PuzzleSchema, state: PuzzleState): boolean => {
    return (schema.horizontalEdgeRules?.every((edgeRule, rowIndex) => validateEdgeRule(edgeRule, state.values[rowIndex])) ?? true)
        && (schema.verticalEdgeRules?.every((edgeRule, colIndex) => validateEdgeRule(edgeRule, state.values.map(row => row[colIndex]))) ?? true)
}
