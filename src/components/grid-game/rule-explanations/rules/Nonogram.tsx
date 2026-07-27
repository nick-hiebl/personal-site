import { NonogramIcon } from '../../NonogramIcon'
import { ExampleGrid } from '../ExampleGrid'
import { RuleExpand } from '../RuleExpand'

export const NonogramExplanation = () => {
    return (
        <RuleExpand
            title="Nonogram rules"
            icons={[
                <NonogramIcon key="1-2" groups={[1, 2]} size="24px" />,
                <NonogramIcon key="2-3-1" groups={[2, 3, 1]} size="24px" />,
                <NonogramIcon key="3" groups={[3]} size="24px" />,
            ]}
            expandContent={
                <div className="column column-center gap-16px">
                    <p className="no-p">
                        These rules visually describe the arrangment of dots in a row or column in
                        terms of groups of contiguous dots.
                    </p>
                    <p className="no-p">
                        For example, the rule below states that the row must have 2 connected dots,
                        at least one empty space, and 1 dot on its own. No other dots may be
                        present in the row. And space can be distributed freely at either end or in
                        the gap between the dots.
                    </p>
                    <div className="max-320">
                        <ExampleGrid
                            state={[true, true, false, false, true, false]}
                            ruleIcon={<div className="rot-90"><NonogramIcon groups={[2, 1]} size="100%" /></div>}
                        />
                    </div>
                    <p className="no-p">
                        The next example describes three groups. A group of 2, a group of 3 and a
                        group of 1. These must each have at least one gap space between them.
                    </p>
                    <div className="max-320">
                        <ExampleGrid
                            state={[true, true, false, true, true, true, false, true]}
                            ruleIcon={<div className="rot-90"><NonogramIcon groups={[2, 3, 1]} size="100%" /></div>}
                        />
                    </div>
                    <p className="no-p">
                        The following rule describes just one group of 3. The row must have three
                        dots exactly, all in a row.
                    </p>
                    <div className="max-320">
                        <ExampleGrid
                            state={[false, true, true, true, false, false]}
                            ruleIcon={<div className="rot-90"><NonogramIcon groups={[3]} size="100%" /></div>}
                        />
                    </div>
                    <p className="no-p">
                        These rules are mutually exclusive. There is no arrangement of dots that
                        would satisfy multiple distinct variants of these rules.
                    </p>
                </div>
            }
        />
    )
}
