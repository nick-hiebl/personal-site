import { useState } from 'react'

import { Modal } from '../../../../../../components/common/Modal'
import { useGameContext } from '../../context'
import type { Coordinate, Item, ItemTrigger, UseItemAction } from '../../types'
import { Grid } from '../Grid'

import { ITEM_NAMES, useItemUnlocked } from './utils'

import './Items.css'

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

                return <Component key={index} item={item} isReadOnly={isReadOnly} />
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
                isReadOnly={isReadOnly}
                action={
                    <button onClick={() => setOpen(true)} disabled={item.used}>Use</button>
                }
            />
            {isOpen && (
                <Modal
                    isOpen={isOpen}
                    onClose={() => setOpen(false)}
                    title={`Use ${ITEM_NAMES[item.type]}`}
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
                                    isCellInteractive={cell => !cell.empty && !cell.revealed && cell.tags.length === 0}
                                    selectedCoordinate={selectedCoordinate}
                                    onSelectCoordinate={coord => setSelectedCoordinate(coord)}
                                />
                            </li>
                        ))}
                    </ul>
                </Modal>
            )}
        </>
    )
}

const AskAll = ({ item, isReadOnly }: ItemProps) => {
    const { output: { state, yourId }, socket } = useGameContext()

    const [isOpen, setOpen] = useState(false)
    const [ownCoordinate, setOwnCoordinate] = useState<Coordinate | undefined>(undefined)
    const [targetGrid, setTargetGrid] = useState<number | undefined>(undefined)

    if (state.state === 'pending') {
        return null
    }

    return (
        <>
            <CommonItem
                item={item}
                isReadOnly={isReadOnly}
                action={
                    <button onClick={() => setOpen(true)} disabled={item.used}>Use</button>
                }
            />
            {isOpen && (
                <Modal
                    isOpen={isOpen}
                    onClose={() => setOpen(false)}
                    title={`Use ${ITEM_NAMES[item.type]}`}
                    actions={[
                        <button
                            key="confirm"
                            disabled={!ownCoordinate || targetGrid === undefined}
                            onClick={() => {
                                if (!ownCoordinate || targetGrid === undefined) {
                                    return
                                }

                                const action: UseItemAction = {
                                    type: 'ask-all',
                                    targetGrid,
                                    ownWire: ownCoordinate,
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
                    <p>Select one of your own cells</p>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId === yourId).map(grid => (
                            <li key={grid.id}>
                                <Grid
                                    grid={grid}
                                    isCellInteractive={cell => {
                                        if (cell.empty || cell.revealed) {
                                            return false
                                        }

                                        const relatedValue = state.valueDetails.find(v => v.value === cell.value)

                                        return !!relatedValue && !relatedValue.isRed && !relatedValue.isYellow
                                    }}
                                    selectedCoordinate={ownCoordinate}
                                    onSelectCoordinate={coord => setOwnCoordinate(coord)}
                                />
                            </li>
                        ))}
                    </ul>
                    <h2>Others' grids</h2>
                    <p>Select someone else's grid with a matching number</p>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId !== yourId).map(grid => (
                            <li key={grid.id}>
                                <Grid
                                    specialSymbol={
                                        <button
                                            disabled={targetGrid === grid.id}
                                            onClick={() => setTargetGrid(grid.id)}
                                        >
                                            Select
                                        </button>
                                    }
                                    isGridSelected={targetGrid === grid.id}
                                    grid={grid}
                                />
                            </li>
                        ))}
                    </ul>
                </Modal>
            )}
        </>
    )
}

type CommonItemProps = {
    item: Item
    action?: React.ReactNode
    isReadOnly?: true
}

const CommonItem = ({ action, isReadOnly, item }: CommonItemProps) => {
    const { output: { state } } = useGameContext()

    const isEnabled = useItemUnlocked(item)

    // const _oldCondition = (
    //     <div className="condition">
    //         {item.unlock.type === 'immediate' ? (
    //             'Always ready'
    //         ) : item.unlock.type === 'value-some' ? (
    //             `Reveal some ${item.unlock.value}`
    //         ) : item.unlock.type === 'value-all' ? (
    //             `Reveal all ${item.unlock.value}`
    //         ) : item.unlock.type === 'yellow-some' ? (
    //             'Reveal some yellow'
    //         ) : item.unlock.type === 'yellow-all' ? (
    //             'Reveal all yellow'
    //         ) : 'ERR: Unknown item trigger'}
    //     </div>
    // )

    return (
        <div className="item">
            <div className="row-center gap-4px">
                <Condition isLocked={!isEnabled} unlock={item.unlock} />
                <h4 data-used={item.used}>{ITEM_NAMES[item.type]}</h4>
            </div>
            {isEnabled && action && !isReadOnly && <div>{action}</div>}
        </div>
    )
}

const Condition = ({ unlock, isLocked }: { unlock: ItemTrigger, isLocked: boolean }) => {
    const lockSymbol = isLocked ? '🔒' : '✅'

    if (unlock.type === 'immediate') {
        return (
            <div className="condition">
                {lockSymbol}
            </div>
        )
    } else if (unlock.type === 'value-some' || unlock.type === 'value-all') {
        return (
            <div className="condition">
                {lockSymbol}{' '}
                {unlock.value}{unlock.type === 'value-all' ? '!' : ''}
            </div>
        )
    } else if (unlock.type === 'yellow-some' || unlock.type === 'yellow-all') {
        return (
            <div className="condition">
                {lockSymbol}{' '}🟨
            </div>
        )
    }

    return (
        <div className="condition">
            ❌
        </div>
    )
}

const ITEM_COMPONENT_MAP: Record<Item['type'], typeof TagOne> = {
    'tag-one': TagOne,
    'ask-all': AskAll,
}
