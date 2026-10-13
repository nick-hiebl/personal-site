import type { MonkeyCommand, MonkeyGame } from '../game'

import type { ProgramContext, Value } from './types'
import type { StackContext } from './executor'

const COMMANDS: MonkeyCommand[] = ['up', 'down', 'left', 'right']

export const createGlobalContext = (game: MonkeyGame, ctx: ProgramContext, monkeyId: number): StackContext => {
    const monkey = game.monkeys.get(monkeyId)

    if (!monkey) {
        throw Error(`Cannot find mind with id: ${monkeyId}`)
    }

    return {
        type: 'root',
        variables: new Map<string, Value>([
            ['Up', 0],
            ['Down', 1],
            ['Left', 2],
            ['Right', 3],
            ['move', { type: 'special', call: async (drn: 0 | 1 | 2 | 3) => {
                if (![0, 1, 2, 3].includes(drn)) {
                    throw Error(`Tried calling 'move' with invalid value '${drn}'`)
                }

                await game.executeCommand(monkeyId, COMMANDS[drn])
                return 0
            }}],
            ['can_move', { type: 'special', call: async (drn: 0 | 1 | 2 | 3) => {
                if (![0, 1, 2, 3].includes(drn)) {
                    throw Error(`Tried calling 'move' with invalid value '${drn}'`)
                }

                return monkey.canMove(COMMANDS[drn] as 'up' | 'down' | 'left' | 'right')
            }}],
            ['can_harvest', { type: 'special', call: async () => {
                return !!monkey.canHarvest()
            }}],
            ['harvest', { type: 'special', call: async () => {
                return await monkey.harvest()
            }}],
            ['plant', { type: 'special', call: async () => {
                await game.executeCommand(monkeyId, 'plant')
                return 0
            }}],
            ['is_grown', { type: 'special', call: async () => {
                return monkey.isGrown()
            }}],
            ['report', { type: 'special', call: async (n: number) => {
                return await monkey.report(n)
            }}],
            ['dump_all', { type: 'special', call: async () => {
                console.log(ctx.contexts)
                return 0
            }}],
            ['stop', { type: 'special', call: async () => {
                ctx.cancel()
                return 1
            }}],
            ['get_x', { type: 'special', call: async () => {
                return monkey?.position.x ?? 0
            }}],
            ['get_y', { type: 'special', call: async () => {
                return monkey?.position.y ?? 0
            }}],
            ['get_width', { type: 'special', call: async () => {
                return game.width
            }}],
            ['get_height', { type: 'special', call: async () => {
                return game.height
            }}],
            ['coin_flip', { type: 'special', call: async () => {
                return Math.random() > 0.5
            }}],
            [
                'range',
                {
                    type: 'special',
                    rejectsArgs: (...argList: any[]) => {
                        if (argList.length === 0 || argList.length > 3) {
                            return Error(`range() received ${argList.length} arguments, but expected 1, 2, or 3`)
                        }

                        if (argList.some(argument => typeof argument !== 'number' || Number.isNaN(argument))) {
                            return Error('range() expected all arguments to be numbers')
                        }

                        if (argList.length === 3) {
                            const [start, end, step] = argList

                            if (Math.sign(end - start) !== Math.sign(step)) {
                                return Error('range() called with start, end, step where step is in wrong direction to start')
                            }
                        }

                        return null
                    },
                    call: async (...argList: [number] | [number, number] | [number, number, number]) => {
                        if (argList.length === 1) {
                            const [max] = argList

                            return new Array(max).fill(0).map((_, index) => index)
                        } else if (argList.length === 2) {
                            const [min, max] = argList

                            return new Array(max - min).fill(0).map((_, index) => index + min)
                        } else if (argList.length === 3) {
                            const [min, max, step] = argList

                            const arr = []

                            for (let i = min; i < max; i += step) {
                                arr.push(i)
                            }

                            return arr
                        }

                        throw Error('Unhandled range() call')
                    },
                },
            ],
            ['print', { type: 'special', rejectsArgs: () => null, call: async (...args: any[]) => {
                console.log(...args)

                return 0
            }}],
        ])
    }
}