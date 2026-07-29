import { TakuzuIcon } from '../../TakuzuIcon'
import { ExampleGrid } from '../ExampleGrid'
import { RuleExpand } from '../RuleExpand'

export const TakuzuExplanation = () => {
    return (
        <RuleExpand
            title="Takuzu rules"
            icons={[
                <TakuzuIcon key="1" size="24px" />,
            ]}
            expandContent={
                <div className="column column-center gap-16px">
                    <p className="no-p">
                        This rule restricts the placements of dots within a line. Nowhere in the
                        line can ever have three dots in a row, or three blank spaces in a row.
                    </p>
                    <p className="no-p">
                        Additionally, the number of filled and empty spaces within the row or
                        column must also be equal, unless the row or column has an odd length, in
                        which case it can be off by one.
                    </p>
                    <div className="max-320">
                        <ExampleGrid
                            state={[true, true, false, false, true, false]}
                            ruleIcon={<div className="rot-90"><TakuzuIcon size="100%" /></div>}
                        />
                    </div>
                    <div className="max-320">
                        <ExampleGrid
                            state={[true, false, false, true, true]}
                            ruleIcon={<div className="rot-90"><TakuzuIcon size="100%" /></div>}
                        />
                    </div>
                </div>
            }
        />
    )
}
