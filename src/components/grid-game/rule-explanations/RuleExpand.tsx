import type { ReactNode } from 'react'

import './Explanations.css'

type Props = {
    title: ReactNode
    icons: ReactNode[]

    expandContent: ReactNode
}

export const RuleExpand = ({ title, icons, expandContent }: Props) => {
    return (
        <details className="rule-expand">
            <summary className="row row-center gap-8px rule-expand-summary">
                <div className="row row-center gap-8px">
                    {icons.map((icon, index) => (
                        <div key={index} className="rule-expand-icon">{icon}</div>
                    ))}
                </div>
                {title}
            </summary>
            <div className="expand-details">
                {expandContent}
            </div>
        </details>
    )
}
