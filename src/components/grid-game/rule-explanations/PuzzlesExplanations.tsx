import { useMemo, type ReactNode } from 'react'

import type { PuzzleSchema, RuleType } from '../schema/types'

import { GroupsExplanation } from './rules/Groups'
import { NonogramExplanation } from './rules/Nonogram'
import { TakuzuExplanation } from './rules/Takuzu'

type Props = {
    schemas: PuzzleSchema[]
}

const RULE_EXPLANATIONS: Partial<Record<RuleType, () => ReactNode>> = {
    nonogram: NonogramExplanation,
    groups: GroupsExplanation,
    takuzu: TakuzuExplanation,
}

const useSchemaRuleTypes = (schemas: PuzzleSchema[]): RuleType[] => {
    return useMemo(() => {
        const ruleTypeSet = new Set<RuleType>()

        schemas.forEach(schema => {
            (schema.horizontalEdgeRules ?? []).concat(schema.verticalEdgeRules ?? []).forEach(edgeRule => {
                if (edgeRule?.type) {
                    ruleTypeSet.add(edgeRule.type)
                }
            })
        })

        return Array.from(ruleTypeSet)
    }, [schemas])
}

export const PuzzlesExplanations = ({ schemas }: Props) => {
    const ruleTypes = useSchemaRuleTypes(schemas)

    return (
        <div id="puzzles-explanations" className="column gap-8px">
            <h2>What is this puzzle?</h2>
            <p className="no-p">
                This is a grid puzzle game in which you must set the correct state of all cells in
                a grid to satisfy a number of rules, which vary for each puzzle.
            </p>
            {ruleTypes.length > 0 && (
                <ul className="column gap-8px">
                    {ruleTypes.map(ruleType => {
                        const Component = RULE_EXPLANATIONS[ruleType]

                        if (!Component) {
                            return null
                        }

                        return (
                            <Component key={ruleType} />
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
