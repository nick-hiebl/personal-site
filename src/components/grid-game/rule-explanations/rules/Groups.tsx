import { GroupsIcon } from '../../GroupsIcon'
import { ExampleGrid } from '../ExampleGrid'
import { RuleExpand } from '../RuleExpand'

export const GroupsExplanation = () => {
    return (
        <RuleExpand
            title="Nonogram rules"
            icons={[
                <GroupsIcon key="1" count={1} mode="vertical" size="24px" />,
                <GroupsIcon key="2" count={2} mode="vertical" size="24px" />,
                <GroupsIcon key="3" count={3} mode="vertical" size="24px" />,
            ]}
            expandContent={
                <div className="column column-center gap-16px">
                    <p className="no-p">
                        These rules describe a number of separated contiguous "groups" of dots.
                        Each group can have any number of dots, and groups must be separated by at
                        least one empty space, with any amount of space allowed at the start or end
                        of the row or column.
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
                            ruleIcon={<div className="rot-90"><GroupsIcon count={2} mode="horizontal" size="100%" /></div>}
                        />
                    </div>
                    <p className="no-p">
                        The next example describes three groups. Each group must each have at least
                        one empty space between them.
                    </p>
                    <div className="max-320">
                        <ExampleGrid
                            state={[true, true, false, true, true, true, false, true]}
                            ruleIcon={<div className="rot-90"><GroupsIcon count={3} mode="horizontal" size="100%" /></div>}
                        />
                    </div>
                    <p className="no-p">
                        The following rule describes a row or column with only one group of
                        connected dots.
                    </p>
                    <div className="max-320">
                        <ExampleGrid
                            state={[false, true, true, true, false, false]}
                            ruleIcon={<div className="rot-90"><GroupsIcon count={1} mode="horizontal" size="100%" /></div>}
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
