import './Tabs.css'

interface TabsProps {
    children: React.ReactNode[]
}

export const Tabs = (props: TabsProps) => {
    return (
        <div className="tab-list">
            {props.children}
        </div>
    )
}

interface TabProps {
    children: React.ReactNode
    onClick: () => void
    selected: boolean
}

export const Tab = ({ children, onClick, selected }: TabProps) => {
    return (
        <button className="tab" data-selected={selected} onClick={onClick}>{children}</button>
    )
}
