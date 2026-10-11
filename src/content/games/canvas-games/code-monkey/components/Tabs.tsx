import React, { useState } from 'react'

import './Tabs.css'

export type TabType = {
    id: string
    label: string
    content: React.ReactNode
}

type Props = {
    tabs: TabType[]
}

export const Tabs = ({ tabs }: Props) => {
    const [currentTab, setCurrentTab] = useState(tabs[0].id)

    return (
        <div className="column gap-8px">
            <div className="row-center gap-8px tab-list">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className="tab"
                        disabled={currentTab === tab.id}
                        onClick={() => { setCurrentTab(tab.id) }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div>
                {tabs.map((tab) => (
                    <div key={tab.id} style={tab.id === currentTab ? undefined : { display: 'none' }}>
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    )
}
