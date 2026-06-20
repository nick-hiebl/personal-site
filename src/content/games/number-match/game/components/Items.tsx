import { useState } from 'react'

import { Modal } from '../../../../../components/common/Modal'
import { useGameContext } from '../context'
import type { Coordinate, Item, UseItemAction } from '../types'

import { Grid } from './Grid'
import { useItemUnlocked } from './items/utils'

type ItemsProps = {
    isReadOnly?: true
}

export const Items = ({ isReadOnly }: ItemsProps) => {
    const { output: { state } } = useGameContext()

    if (state.state === 'pending' || state.items.length === 0) {
        return null
    }

    return (
        <div>
            <h3>Items</h3>
            {state.items.map((item, index) => {
                const Component = ITEM_COMPONENT_MAP[item.type]

                if (!Component) {
                    return null
                }

                return <Component key={index} item={item} />
            })}
        </div>
    )
}

type ItemProps = {
    item: Item
    isReadOnly?: true
}

const TagOne = ({ item, isReadOnly }: ItemProps) => {
    const { output: { state, yourId }, socket } = useGameContext()

    const [isOpen, setOpen] = useState(false)
    const [selectedCoordinate, setSelectedCoordinate] = useState<Coordinate | undefined>(undefined)

    if (state.state === 'pending') {
        return null
    }

    return (
        <>
            <CommonItem
                item={item}
                title="Tag one"
                isReadOnly={isReadOnly}
                action={
                    <button onClick={() => setOpen(true)} disabled={item.used}>Use</button>
                }
            />
            <Modal
                isOpen={isOpen}
                onClose={() => setOpen(false)}
                title="Use Tag One item"
                actions={[
                    <button
                        key="confirm"
                        disabled={!selectedCoordinate}
                        onClick={() => {
                            if (!selectedCoordinate) {
                                return
                            }

                            const action: UseItemAction = {
                                type: 'tag-one',
                                coordinate: selectedCoordinate,
                            }

                            socket.emit('use-item', action)
                            setOpen(false)
                        }}
                    >
                        Confirm
                    </button>,
                    <button key="cancel" onClick={() => setOpen(false)}>Cancel</button>,
                ]}
            >
                <h2>Your grids</h2>
                <ul>
                    {state.grids.filter(grid => grid.ownerId === yourId).map(grid => (
                        <li key={grid.id}>
                            <Grid
                                grid={grid}
                                isCellInteractive={cell => !cell.empty && cell.tags.length === 0}
                                selectedCoordinate={selectedCoordinate}
                                onSelectCoordinate={coord => setSelectedCoordinate(coord)}
                            />
                        </li>
                    ))}
                </ul>
            </Modal>
        </>
    )
}

type CommonItemProps = {
    item: Item
    title: React.ReactNode
    action?: React.ReactNode
    isReadOnly?: true
}

const CommonItem = ({ action, isReadOnly, item, title }: CommonItemProps) => {
    const { output: { state } } = useGameContext()

    const isEnabled = useItemUnlocked(item)

    return (
        <div className="item">
            <h4 data-used={item.used}>{title}</h4>
            <div className="condition">
                {item.unlock.type === 'immediate' ? (
                    'Always ready'
                ) : item.unlock.type === 'value-some' ? (
                    `Reveal some ${item.unlock.value}`
                ) : item.unlock.type === 'value-all' ? (
                    `Reveal all ${item.unlock.value}`
                ) : item.unlock.type === 'yellow-some' ? (
                    'Reveal some yellow'
                ) : item.unlock.type === 'yellow-all' ? (
                    'Reveal all yellow'
                ) : 'ERR: Unknown item trigger'}
            </div>
            {isEnabled && action && !isReadOnly && <div>{action}</div>}
        </div>
    )
}

const ITEM_COMPONENT_MAP: Record<Item['type'], typeof TagOne> = {
    'tag-one': TagOne,
}
