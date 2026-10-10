import type { MonkeyGame, MoveCommand } from '../game'

import type { BlockStatement, Expression, FuncDeclStatement, ProgramTree, Statement } from '.'

type CoreFunction = {
    type: 'special'
    call: () => Promise<number | boolean>
}

type EvaluableFunction = {
    type: 'function'
    declaration: FuncDeclStatement
    closure: StackContext[]
}

export interface StackContext {
    type: 'global' | 'scope' | 'function'
    variables: Map<string, CoreFunction | EvaluableFunction | number | boolean>
}

const last = <T>(list: T[]): T => {
    return list[list.length - 1]
}

const COMMANDS: MoveCommand[] = ['up', 'down', 'left', 'right']

const createGlobalContext = (game: MonkeyGame, ctx: ProgramContext): StackContext => {
    return {
        type: 'global',
        variables: new Map([
            ...COMMANDS.map<[string, CoreFunction]>(cmd => [cmd, { type: 'special', call: async () => {
                await game.executeCommand(cmd)
                return 0
            }}]),
            ['dump_all', { type: 'special', call: async () => {
                console.log(ctx.contexts)
                return 0
            }}],
            ['stop', { type: 'special', call: async () => {
                ctx.cancel()
                return 1
            }}]
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
    for (const statement of blockStatement.statements) {
        if (!ctx.running()) {
            throw Error('Cancelled')
        }

        await executeStatement(statement, game, ctx)
    }
}

export const executeStatement = async (statement: Statement, game: MonkeyGame, ctx: ProgramContext) => {
    if (!ctx.running()) {
        throw Error('Cancelled')
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

        const definitionRoot = availableContexts.findLast(c => c.variables.has(statement.identifier.value))
            ?? last(availableContexts)

        definitionRoot.variables.set(statement.identifier.value, computedResult)
    } else if (statement.type === 'while-statement') {
        while (true) {
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
                    { type: 'scope', variables: new Map() },
                ],
            })
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
        throw Error('Comparing two unlike objects is not allowed')
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
        } else {
            return leftValue / rightValue
        }
    } else if (expr.type === 'unary-expr') {
        return !(await evaluateExpr(expr.expression, game, ctx))
    } else if (expr.type === 'call-expr') {
        const func = findInContexts(expr.identifier.value, ctx)

        if (!func || typeof func !== 'object') {
            throw Error(`Calling a non-function with name: ${expr.identifier.value}`)
        }

        if (func.type === 'function') {
            await executeBlockStatement(
                func.declaration.block,
                game,
                {
                    ...ctx,
                    contexts: [
                        ...func.closure,
                        // Will need to set up arguments here eventually
                        { type: 'function', variables: new Map() },
                    ],
                },
            )
            // Gotta return actual value at some point
        } else {
            return await func.call()
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
