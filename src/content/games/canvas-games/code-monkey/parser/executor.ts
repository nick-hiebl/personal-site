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
    variables: Map<string, CoreFunction | EvaluableFunction | number | boolean>
}

const last = <T>(list: T[]): T => {
    return list[list.length - 1]
}

const COMMANDS: MoveCommand[] = ['up', 'down', 'left', 'right']

const createGlobalContext = (game: MonkeyGame): StackContext => {
    return {
        variables: new Map([
            ...COMMANDS.map<[string, CoreFunction]>(cmd => [cmd, { type: 'special', call: async () => {
                await game.executeCommand(cmd)
                return 0
            }}]),
        ])
    }
}

export const executeProgram = async (program: ProgramTree, game: MonkeyGame) => {
    const contextList: StackContext[] = [createGlobalContext(game)]

    await executeBlockStatement(program.block, game, contextList)
}

export const executeBlockStatement = async (blockStatement: BlockStatement, game: MonkeyGame, contexts: StackContext[]) => {
    for (const statement of blockStatement.statements) {
        await executeStatement(statement, game, contexts)
    }
}

export const executeStatement = async (statement: Statement, game: MonkeyGame, contexts: StackContext[]) => {
    if (statement.type === 'func-decl') {
        const evaluable: EvaluableFunction = {
            type: 'function',
            declaration: statement,
            closure: contexts,
        }

        last(contexts).variables.set(statement.name.value, evaluable)
    } else if (statement.type === 'assignment-statement') {
        last(contexts).variables.set(statement.identifier.value, await evaluateExpr(statement.expression, game, contexts))
    } else if (statement.type === 'expression-statement') {
        await evaluateExpr(statement.expression, game, contexts)
    }
}

export const evaluateExpr = async (expr: Expression, game: MonkeyGame, contexts: StackContext[]): Promise<number | boolean> => {
    if (expr.type === 'additive-expr' || expr.type === 'multiplicative-expr') {
        const leftValue = await evaluateExpr(expr.leftOperand, game, contexts)
        const rightValue = await evaluateExpr(expr.rightOperand, game, contexts)

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
        return !(await evaluateExpr(expr.expression, game, contexts))
    } else if (expr.type === 'call-expr') {
        const func = findInContexts(expr.identifier.value, contexts)

        if (!func || typeof func !== 'object') {
            throw Error(`Calling a non-function with name: ${expr.identifier.value}`)
        }

        if (func.type === 'function') {
            await executeBlockStatement(
                func.declaration.block,
                game,
                [
                    ...func.closure,
                    // Will need to set up arguments here eventually
                    { variables: new Map() },
                ],
            )
            // Gotta return actual value at some point
        } else {
            console.log('About to call!', func.type, func.call)
            return await func.call()
        }

        return 0
    } else if (expr.type === 'booleanliteral') {
        return expr.value
    } else if (expr.type === 'numberliteral') {
        return expr.value
    } else if (expr.type === 'identifier') {
        const res = findInContexts(expr.value, contexts)

        if (typeof res !== 'number' && typeof res !== 'boolean') {
            throw Error('Evaluating identifier-only expression which resolves to non-value')
        }

        return res
    } else if (expr.type === 'primary-expr') {
        return evaluateExpr(expr.expression, game, contexts)
    } else {
        console.error(expr)
        throw Error('Unexpected expression type!')
    }
}

const findInContexts = (name: string, contexts: StackContext[]): CoreFunction | EvaluableFunction | number | boolean => {
    const relevantContext = contexts.findLast(c => c.variables.has(name))

    if (!relevantContext) {
        throw Error(`NameError: could not find name: '${name}'`)
    }

    return relevantContext.variables.get(name)!
}
