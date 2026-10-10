import type { MonkeyGame, MoveCommand } from '../game'

import type { BlockStatement, Expression, FuncDeclStatement, ProgramTree, Statement } from '.'

type CoreFunction = {
    type: 'special'
    call: (...args: any[]) => Promise<number | boolean>
}

type EvaluableFunction = {
    type: 'function'
    declaration: FuncDeclStatement
    closure: StackContext[]
}

type Value = CoreFunction | EvaluableFunction | number | boolean

export type StackContext = {
    type: 'global' | 'scope'
    variables: Map<string, Value>
} | {
    type: 'function'
    variables: Map<string, Value>
    isReturned: () => boolean
    returnFromFunc: (returnValue?: Value) => void
} | {
    type: 'loop'
    variables: Map<string, Value>
    isBroken: () => boolean
    breakLoop: () => void
}

const last = <T>(list: T[]): T => {
    return list[list.length - 1]
}

const COMMANDS: MoveCommand[] = ['up', 'down', 'left', 'right']

const createGlobalContext = (game: MonkeyGame, ctx: ProgramContext): StackContext => {
    return {
        type: 'global',
        variables: new Map<string, Value>([
            ['Up', 0],
            ['Down', 1],
            ['Left', 2],
            ['Right', 3],
            ['move', { type: 'special', call: async (drn: 0 | 1 | 2 | 3) => {
                if (![0, 1, 2, 3].includes(drn)) {
                    throw Error(`Tried calling 'move' with invalid value '${drn}'`)
                }

                await game.executeCommand(COMMANDS[drn])
                return 0
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
                return game.x
            }}],
            ['get_y', { type: 'special', call: async () => {
                return game.y
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
        ])
    }
}

type ProgramContext = {
    contexts: StackContext[]
    running: () => boolean
    cancel: () => void
}

type ExternalProgramState = {
    promise: Promise<void>
    cancel: () => void
}

export const executeProgram = (program: ProgramTree, game: MonkeyGame): ExternalProgramState => {
    let running = true

    const programContext: ProgramContext = {
        contexts: [],
        running: () => running,
        cancel: () => { running = false },
    }

    programContext.contexts.push(createGlobalContext(game, programContext))

    return {
        promise: executeBlockStatement(program.block, game, programContext),
        cancel: () => { running = false },
    }
}

export const executeBlockStatement = async (blockStatement: BlockStatement, game: MonkeyGame, ctx: ProgramContext) => {
    const currentFunc = ctx.contexts.findLast(c => c.type === 'function')
    const currentLoop = ctx.contexts.findLast(c => c.type === 'loop')

    for (const statement of blockStatement.statements) {
        if (!ctx.running()) {
            throw Error('Cancelled')
        }

        if ((currentFunc && currentFunc.isReturned()) || (currentLoop && currentLoop.isBroken())) {
            return
        }

        await executeStatement(statement, game, ctx)
    }
}

export const executeStatement = async (statement: Statement, game: MonkeyGame, ctx: ProgramContext) => {
    if (!ctx.running()) {
        throw Error('Cancelled')
    }

    const currentFunc = ctx.contexts.findLast(c => c.type === 'function')
    const currentLoop = ctx.contexts.findLast(c => c.type === 'loop')

    const isTerminatedAbove = () => {
        return (currentFunc && currentFunc.isReturned()) || (currentLoop && currentLoop.isBroken())
    }

    if (isTerminatedAbove()) {
        return
    }

    if (statement.type === 'func-decl') {
        const evaluable: EvaluableFunction = {
            type: 'function',
            declaration: statement,
            closure: ctx.contexts,
        }

        last(ctx.contexts).variables.set(statement.name.value, evaluable)
    } else if (statement.type === 'assignment-statement') {
        const computedResult = await evaluateExpr(statement.expression, game, ctx)

        const availableContexts = ctx.contexts.slice(ctx.contexts.findLastIndex(c => c.type === 'function' || c.type === 'global'))

        if (statement.assignmentType === '=') {
            const definitionRoot = availableContexts.findLast(c => c.variables.has(statement.identifier.value))
                ?? last(availableContexts)

            const currentValue = definitionRoot.variables.get(statement.identifier.value)

            if (typeof currentValue === 'object') {
                throw Error(`Assigning value to '${statement.identifier.value}' which is not an assign-able variable in this context`)
            }
    
            definitionRoot.variables.set(statement.identifier.value, computedResult)
        } else {
            const definitionRoot = availableContexts.findLast(c => c.variables.has(statement.identifier.value))

            if (!definitionRoot) {
                throw Error(`Attempting '${statement.assignmentType}' operation on '${statement.identifier.value}' which is not defined or available in this scope`)
            }

            const currentValue = definitionRoot.variables.get(statement.identifier.value)

            if (typeof currentValue === 'object') {
                throw Error(`Attempting '${statement.assignmentType}' operation on '${statement.identifier.value}' which is not an assign-able variable in this context`)
            }

            if (['+=', '-=', '*=', '/=', '%='].includes(statement.assignmentType)) {
                if (typeof computedResult !== 'number') {
                    throw Error(`Attempting '${statement.assignmentType}' operation with non-numeric value`)
                } else if (typeof currentValue !== 'number') {
                    throw Error(`Attempting '${statement.assignmentType}' operation on non-numeric variable`)
                }
            }

            let newValue = currentValue
            if (statement.assignmentType === '+=') {
                newValue = (currentValue as number) + (computedResult as number)
            } else if (statement.assignmentType === '-=') {
                newValue = (currentValue as number) - (computedResult as number)
            } else if (statement.assignmentType === '*=') {
                newValue = (currentValue as number) * (computedResult as number)
            } else if (statement.assignmentType === '/=') {
                newValue = (currentValue as number) / (computedResult as number)
            } else if (statement.assignmentType === '%=') {
                newValue = (currentValue as number) % (computedResult as number)
            } else {
                throw Error(`Unhandled assignment operation type: '${statement.assignmentType}'`)
            }

            definitionRoot.variables.set(statement.identifier.value, newValue)
        }
    } else if (statement.type === 'while-statement') {
        let broken = false

        const breakLoop = () => { broken = true }

        while (!broken && !isTerminatedAbove()) {
            if (!ctx.running()) {
                throw Error('Cancelled')
            }

            const conditionResult = await evaluateExpr(statement.condition, game, ctx)

            if (!conditionResult) {
                break
            }

            await executeBlockStatement(statement.block, game, {
                ...ctx,
                contexts: [
                    ...ctx.contexts,
                    {
                        type: 'loop',
                        variables: new Map(),
                        isBroken: () => broken,
                        breakLoop,
                    },
                ],
            })
        }
    } else if (statement.type === 'break-statement') {
        if (!currentLoop) {
            throw Error('Break statement used outside of loop')
        }

        currentLoop.breakLoop()
    } else if (statement.type === 'return-statement') {
        if (!currentFunc) {
            throw Error('Return statement used outside of function')
        }

        if (statement.value) {
            const value = await evaluateExpr(statement.value, game, ctx)
            currentFunc.returnFromFunc(value)
        } else {
            currentFunc.returnFromFunc()
        }
    } else if (statement.type === 'if-statement') {
        const conditionResult = await evaluateExpr(statement.condition, game, ctx)

        if (conditionResult) {
            await executeBlockStatement(statement.block, game, {
                ...ctx,
                contexts: [
                    ...ctx.contexts,
                    { type: 'scope', variables: new Map() },
                ],
            })
        } else if (statement.elseBlock) {
            if (statement.elseBlock.type === 'block') {
                await executeBlockStatement(statement.elseBlock, game, {
                    ...ctx,
                    contexts: [
                        ...ctx.contexts,
                        { type: 'scope', variables: new Map() },
                    ],
                })
            } else {
                await executeStatement(statement.elseBlock, game, ctx)
            }
        }
    } else if (statement.type === 'expression-statement') {
        await evaluateExpr(statement.expression, game, ctx)
    }
}

type EvaluatedCondition = {
    truthy: boolean
    leftValue: number | boolean
    rightValue: number | boolean
}

const compare = (left: number | boolean, right: number | boolean, mode: '==' | '!=' | '<' | '>' | '<=' | '>='): boolean => {
    if (typeof left !== typeof right) {
        throw Error(`Comparing two unlike objects is not allowed: ${typeof left}, ${typeof right}`)
    }

    if (mode === '==') {
        return left === right
    } else if (mode === '!=') {
        return left !== right
    }
    
    if (typeof left !== 'number' || typeof right !== 'number') {
        throw Error(`Comparison operator: '${mode}' used on non-number values`)
    }
    
    if (mode === '<') {
        return left < right
    } else if (mode === '>') {
        return left > right
    } else if (mode === '<=') {
        return left <= right
    } else if (mode === '>=') {
        return left >= right
    }

    throw Error(`Left processing some some bizarre operation: '${mode}'`)
}

export const evaluateConditionExpressions = async (expr: Expression, game: MonkeyGame, ctx: ProgramContext): Promise<EvaluatedCondition | number | boolean> => {
    if (expr.type === 'equality-expr' || expr.type === 'relative-expr') {
        const left = await evaluateConditionExpressions(expr.leftOperand, game, ctx)

        // Short-circuiting
        if (typeof left === 'object' && !left.truthy) {
            return false
        }

        const right = await evaluateConditionExpressions(expr.rightOperand, game, ctx)

        if (typeof right === 'object' && !right.truthy) {
            return false
        }

        if (typeof left === 'object') {
            if (typeof right === 'object') {
                return {
                    truthy: compare(left.rightValue, right.leftValue, expr.mode),
                    leftValue: left.leftValue,
                    rightValue: right.rightValue,
                }
            } else {
                return {
                    truthy: compare(left.rightValue, right, expr.mode),
                    leftValue: left.leftValue,
                    rightValue: right,
                }
            }
        } else {
            if (typeof right === 'object') {
                return {
                    truthy: compare(left, right.leftValue, expr.mode),
                    leftValue: left,
                    rightValue: right.rightValue,
                }
            } else {
                return {
                    truthy: compare(left, right, expr.mode),
                    leftValue: left,
                    rightValue: right,
                }
            }
        }
    } else {
        return await evaluateExpr(expr, game, ctx)
    }
}

export const evaluateExpr = async (expr: Expression, game: MonkeyGame, ctx: ProgramContext): Promise<number | boolean> => {
    if (!ctx.running()) {
        throw Error('Cancelled')
    }

    if (expr.type === 'cond-or-expr') {
        const leftResult = await evaluateExpr(expr.leftOperand, game, ctx)

        if (leftResult) {
            return leftResult
        }

        return await evaluateExpr(expr.rightOperand, game, ctx)
    } else if (expr.type === 'cond-and-expr') {
        const leftResult = await evaluateExpr(expr.leftOperand, game, ctx)

        if (!leftResult) {
            return leftResult
        }

        return await evaluateExpr(expr.rightOperand, game, ctx)
    } else if (expr.type === 'equality-expr' || expr.type === 'relative-expr') {
        const result = await evaluateConditionExpressions(expr, game, ctx)

        if (typeof result === 'object') {
            return result.truthy
        }

        return result
    } else if (expr.type === 'additive-expr' || expr.type === 'multiplicative-expr') {
        const leftValue = await evaluateExpr(expr.leftOperand, game, ctx)
        const rightValue = await evaluateExpr(expr.rightOperand, game, ctx)

        if (typeof leftValue !== 'number' || typeof rightValue !== 'number') {
            throw Error('Adding non-numbers!')
        }

        if (expr.mode === '+') {
            return leftValue + rightValue
        } else if (expr.mode === '-') {
            return leftValue - rightValue
        } else if (expr.mode === '*') {
            return leftValue * rightValue
        } else if (expr.mode === '/') {
            return leftValue / rightValue
        } else {
            return leftValue % rightValue
        }
    } else if (expr.type === 'unary-expr') {
        if (expr.unaryOperation === 'not') {
            const value = await evaluateExpr(expr.expression, game, ctx)

            return !value
        } else if (expr.unaryOperation === '+' || expr.unaryOperation === '-') {
            const value = await evaluateExpr(expr.expression, game, ctx)

            if (typeof value !== 'number') {
                throw Error(`Trying to use '${expr.unaryOperation}' unary operator on non-numeric value`)
            }

            if (expr.unaryOperation === '+') {
                return +value
            } else {
                return -value
            }
        } else {
            throw Error(`Un-managed unary operator: ${expr.unaryOperation}`)
        }
    } else if (expr.type === 'call-expr') {
        const func = findInContexts(expr.identifier.value, ctx)

        if (!func || typeof func !== 'object') {
            throw Error(`Calling a non-function with name: ${expr.identifier.value}`)
        }

        if (func.type === 'function') {
            let returned = false
            let returnValue = undefined

            if (expr.argList.length !== func.declaration.parameterList.length) {
                throw new Error(`Called function '${func.declaration.name.value}' with ${expr.argList.length} argument(s), expected ${func.declaration.parameterList.length}`)
            }
            const argumentList: Value[] = []

            for (const argument of expr.argList) {
                argumentList.push(await evaluateExpr(argument, game, ctx))
            }

            const returnFromFunc = (value?: Value) => {
                if (value && typeof value !== 'number' && typeof value !== 'boolean') {
                    throw Error('Returning non-number / non-boolean from function!')
                }

                returnValue = value ?? undefined
                returned = true
            }

            await executeBlockStatement(
                func.declaration.block,
                game,
                {
                    ...ctx,
                    contexts: [
                        ...func.closure,
                        {
                            type: 'function',
                            variables: new Map([
                                ...func.declaration.parameterList.map<[string, Value]>((parameter, index) => [
                                    parameter.value,
                                    argumentList[index],
                                ])
                            ]),
                            isReturned: () => returned,
                            returnFromFunc,
                        },
                    ],
                },
            )

            if (returnValue !== undefined) {
                return returnValue
            }
        } else {
            if (expr.argList.length !== func.call.length) {
                throw new Error(`Calling built-in function '${expr.identifier.value}' with ${expr.argList.length} argument(s), expected ${func.call.length}`)
            }

            const argumentList: Value[] = []

            for (const argument of expr.argList) {
                argumentList.push(await evaluateExpr(argument, game, ctx))
            }

            return await func.call(...argumentList)
        }

        return 0
    } else if (expr.type === 'booleanliteral') {
        return expr.value
    } else if (expr.type === 'numberliteral') {
        return expr.value
    } else if (expr.type === 'identifier') {
        const res = findInContexts(expr.value, ctx)

        if (typeof res !== 'number' && typeof res !== 'boolean') {
            throw Error('Evaluating identifier-only expression which resolves to non-value')
        }

        return res
    } else if (expr.type === 'primary-expr') {
        return evaluateExpr(expr.expression, game, ctx)
    } else {
        console.error(expr)
        throw Error('Unexpected expression type!')
    }
}

const findInContexts = (name: string, ctx: ProgramContext): CoreFunction | EvaluableFunction | number | boolean => {
    const relevantContextIndex = ctx.contexts.findLastIndex(c => c.variables.has(name))

    const mostRecentFunctionIndex = ctx.contexts.findLastIndex(c => c.type === 'function' || c.type === 'global')

    if (relevantContextIndex === -1) {
        throw Error(`NameError: could not find name: '${name}'`)
    }

    const value = ctx.contexts[relevantContextIndex].variables.get(name)!

    if (typeof value === 'number' || typeof value === 'boolean') {
        if (relevantContextIndex < mostRecentFunctionIndex) {
            console.log(ctx)
            throw Error(`ScopeError: could not find name: '${name}' in current ${ctx.contexts[mostRecentFunctionIndex].type} scope`)
        }
    }

    return ctx.contexts[relevantContextIndex].variables.get(name)!
}
