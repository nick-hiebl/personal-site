import type { Token } from 'monaco-editor'

type MyToken = Token & {
    lineNumber: number
    text: string
}

const IDENTIFIER_REGEX = /[a-zA-Z_][a-zA-Z0-9_]*/

/**
 * program                  -> block-statement
 * identifier               -> ID
 * 
 * // Statements
 * block-statement          -> @indentation statement*
 * statement                -> expr-statement
 *                          | func-decl-statement
 * func-decl                -> "def" identifier "(" ")" block-statement
 * expr-statement           -> expression? "\n"
 *                          | identifier "=" expression? "\n"
 * 
 * // Expressions
 * expression               -> additive-expr
 * additive-expr            -> multiplicative-expr
 *                          | additive-expr "+" multiplicative-expr
 *                          | additive-expr "-" multiplicative-expr
 * multiplicative-expr      -> unary-expr
 *                          | multiplicative-expr "*" unary-expr
 *                          | multiplicative-expr "/" unary-expr
 * unary-expr               -> "not" unary-expr
 *                          | primary-expr
 * primary-expr             -> identifier
 *                          | INTLITERAL
 *                          | BOOLEANLITERAL
 *                          | "(" expr ")"
 */

export type ProgramTree = {
    type: 'program'
    block: BlockStatement
}
export type Identifier = {
    type: 'identifier'
    value: string
}

export type BlockStatement = {
    type: 'block'
    offset: number
    statements: Statement[]
}

export type Statement = FuncDeclStatement | WhileStatement | IfStatement | ExprStatement | BreakStatement | ReturnStatement

export type FuncDeclStatement = {
    type: 'func-decl'
    name: Identifier
    block: BlockStatement
}

export type WhileStatement = {
    type: 'while-statement'
    condition: Expression
    block: BlockStatement
}

export type IfStatement = {
    type: 'if-statement'
    condition: Expression
    block: BlockStatement
    elseBlock?: BlockStatement | IfStatement
}

export type ExprStatement = {
    type: 'expression-statement'
    expression: Expression
} | {
    type: 'assignment-statement'
    identifier: Identifier
    expression: Expression
}

export type BreakStatement = {
    type: 'break-statement'
}

export type ReturnStatement = {
    type: 'return-statement'
    value?: Expression
}

type BinaryExpr<T extends string, Child, Operators> = {
    type: T
    mode: Operators
    leftOperand: Expression
    rightOperand: Expression
}

export type Expression = CondOrExpr
export type CondOrExpr = CondAndExpr
    | BinaryExpr<'cond-or-expr', CondAndExpr, 'or'>
export type CondAndExpr = EqualityExpr
    | BinaryExpr<'cond-and-expr', EqualityExpr, 'and'>
export type EqualityExpr = RelativeExpr
    | BinaryExpr<'equality-expr', RelativeExpr, '==' | '!='>
export type RelativeExpr = AdditiveExpr
    | BinaryExpr<'relative-expr', AdditiveExpr, '<' | '>' | '<=' | '>='>

export type AdditiveExpr = MultiplicativeExpr
    | BinaryExpr<'additive-expr', MultiplicativeExpr, '+' | '-'>
export type MultiplicativeExpr = UnaryExpr
    | {
        type: 'multiplicative-expr'
        mode: '*' | '/'
        leftOperand: MultiplicativeExpr
        rightOperand: MultiplicativeExpr
    }

export type UnaryExpr = PrimaryExpr
    | {
        type: 'unary-expr'
        expression: UnaryExpr
    }
export type PrimaryExpr = Identifier
    | { type: 'numberliteral', value: number }
    | { type: 'booleanliteral', value: boolean }
    // "(" expression ")"
    | { type: 'primary-expr', expression: Expression }
    | { type: 'call-expr', identifier: Identifier, argList: Expression[] }

export const parseProgram = (lines: string[], tokens: MyToken[]): ProgramTree => {
    const [block, afterTokens] = parseBlockStatement(lines, tokens, 0)

    if (afterTokens.length > 0) {
        console.warn('Found leftover tokens after program block!', afterTokens)
    }

    return {
        type: 'program',
        block,
    }
}

const parseBlockStatement = (lines: string[], tokens: MyToken[], indentation: number): [BlockStatement, MyToken[]] => {
    const firstLefterTokenIndex = tokens.findIndex(token => {
        return token.type !== 'white.python' && token.offset < indentation
    })

    const blockTokens = tokens.slice(0, firstLefterTokenIndex === -1 ? undefined : firstLefterTokenIndex)

    const statements: Statement[] = []

    if (blockTokens.length > 0) {
        let [nextStatement, remaining] = parseStatement(lines, blockTokens, indentation)
        if (nextStatement) {
            statements.push(nextStatement)
        }
    
        while (remaining.length > 0) {
            [nextStatement, remaining] = parseStatement(lines, remaining, indentation)
            
            if (nextStatement) {
                statements.push(nextStatement)
            }
        }
    }

    return [
        {
            type: 'block',
            offset: indentation,
            statements,
        },
        firstLefterTokenIndex === -1 ? [] : tokens.slice(firstLefterTokenIndex),
    ]
}

const parseIdentifier = (lines: string[], token: MyToken): Identifier => {
    const match = IDENTIFIER_REGEX.exec(lines[token.lineNumber].slice(token.offset))

    if (!match) {
        throw tokenError('Could not find identifier when parsing line:', token)
    }

    return {
        type: 'identifier',
        value: match[0],
    }
}

const SOME_TEXT_REGEX = /[^\s]+/

export const parseText = (lines: string[], token: MyToken, nextToken: MyToken | undefined): string | undefined => {
    const endOffset = nextToken?.lineNumber === token.lineNumber
        ? nextToken.offset
        : undefined

    const textToSearch = lines[token.lineNumber].slice(token.offset, endOffset)
    const match = SOME_TEXT_REGEX.exec(textToSearch)

    if (!match) {
        return undefined
    }

    return match[0] || undefined
}

const parseStatement = (lines: string[], tokens: MyToken[], indentation: number): [Statement | undefined, MyToken[]] => {
    if (tokens[0].type === 'keyword.python') {
        if (tokens[0].text === 'def') {
            return parseFuncDecl(lines, tokens, indentation)
        } else if (tokens[0].text === 'while') {
            return parseWhileStmt(lines, tokens, indentation)
        } else if (tokens[0].text === 'if') {
            return parseIfStmt(lines, tokens, indentation, 'if')
        } else if (tokens[0].text === 'break') {
            if (tokens.length > 1) {
                throw tokenError('Expected break statement to be only part of statement', tokens[0])
            }

            return [{ type: 'break-statement' }, []]
        } else if (tokens[0].text === 'return') {
            if (tokens.length > 1) {
                const [value, rest] = parseExpression(lines, tokens.slice(1))

                if (rest.length > 0) {
                    throw tokenError('Expected nothing after expression in return statement', rest[0])
                }

                return [{ type: 'return-statement', value }, []]
            } else {
                return [{ type: 'return-statement' }, []]
            }
        }
    }

    const firstToken = tokens[0]
    if (!firstToken) {
        return [undefined, []]
    }

    if (firstToken.offset !== indentation) {
        throw tokenError('Bad indentation at', firstToken)
    }

    const postLineIndex = tokens.findIndex((token) => token.lineNumber > firstToken.lineNumber)

    if (firstToken.type === 'identifier.python') {
        const assignmentName = parseIdentifier(lines, firstToken)
        if (assignmentName && tokens[1]?.type === '') {
            if (tokens[1]?.text === '=') {
                const [childExpression, extraTokens] = parseExpression(lines, tokens.slice(2, postLineIndex === -1 ? undefined : postLineIndex))

                if (extraTokens.length > 0) {
                    throw tokenError('Extra tokens after assignment???', extraTokens[0])
                }

                return [
                    {
                        type: 'assignment-statement',
                        identifier: assignmentName,
                        expression: childExpression,
                    },
                    postLineIndex === -1
                        ? []
                        : tokens.slice(postLineIndex),
                ]
            }
        }
    }

    const [childExpression, extraTokens] = parseExpression(lines, tokens.slice(0, postLineIndex === -1 ? undefined : postLineIndex))

    if (extraTokens.length > 0) {
        throw tokenError('Extra tokens after statement???', extraTokens[0])
    }

    return [
        {
            type: 'expression-statement',
            expression: childExpression,
        },
        postLineIndex === -1
            ? []
            : tokens.slice(postLineIndex),
    ]
}

const parseFuncDecl = (lines: string[], tokens: MyToken[], indentation: number): [FuncDeclStatement, MyToken[]] => {
    if (tokens[0]?.type !== 'keyword.python') {
        throw Error('Parsing function declaration not starting with def')
    }

    const ident = parseIdentifier(lines, tokens[0])

    if (ident.value !== 'def') {
        throw Error('Keyword in function declaration not def??')
    }

    const nameToken = tokens[1]

    if (!nameToken || nameToken.type !== 'identifier.python') {
        throw Error('No name for this function declaration!')
    }

    const nameIdent = parseIdentifier(lines, nameToken)

    const parens = tokens[2]
    if (!parens || parens.type !== 'delimiter.parenthesis.python') {
        throw Error('No parenthesis on function declaration')
    }

    const colon = tokens[3]
    if (!colon || colon.type !== 'delimiter.python') {
        throw Error('No colon on function declaration')
    }

    const [block, afterBlock] = parseBlockStatement(lines, tokens.slice(4), indentation + 4)

    return [
        {
            type: 'func-decl',
            name: nameIdent,
            block,
        },
        afterBlock,
    ]
}

const parseWhileStmt = (lines: string[], tokens: MyToken[], indentation: number): [WhileStatement, MyToken[]] => {
    if (tokens[0]?.type !== 'keyword.python') {
        throw tokenError(`Expected 'while' at`, tokens[0])
    }

    if (tokens[0].text !== 'while') {
        throw tokenError(`Expected 'while' at`, tokens[0])
    }

    const [expression, rest] = parseExpression(lines, tokens.slice(1))

    const colon = rest[0]
    if (!colon || colon.type !== 'delimiter.python') {
        throw tokenError('Expected colon in while statement at', colon)
    }

    const [block, afterBlock] = parseBlockStatement(lines, rest.slice(1), indentation + 4)

    return [
        {
            type: 'while-statement',
            condition: expression,
            block,
        },
        afterBlock,
    ]
}

const parseIfStmt = (lines: string[], tokens: MyToken[], indentation: number, expecting: 'if' | 'elif'): [IfStatement, MyToken[]] => {
    if (tokens[0]?.type !== 'keyword.python') {
        throw tokenError(`Expected '${expecting}' at`, tokens[0])
    }

    if (tokens[0].text !== expecting) {
        throw tokenError(`Expected '${expecting}' at`, tokens[0])
    }

    const [expression, rest] = parseExpression(lines, tokens.slice(1))

    const colon = rest[0]
    if (!colon || colon.type !== 'delimiter.python') {
        throw tokenError('Expected colon in if statement at', colon)
    }

    const [block, afterBlock] = parseBlockStatement(lines, rest.slice(1), indentation + 4)

    let elseBlock: IfStatement

    if (afterBlock[0]?.type === 'keyword.python') {
        if (afterBlock[0].text === 'else') {
            if (afterBlock[1]?.type !== 'delimiter.python') {
                throw tokenError('Expected colon in else statement at', afterBlock[1])
            }
            const [elseBlock, postElse] = parseBlockStatement(lines, afterBlock.slice(2), indentation + 4)

            return [
                {
                    type: 'if-statement',
                    condition: expression,
                    block,
                    elseBlock,
                },
                postElse,
            ]
        } else if (afterBlock[0].text === 'elif') {
            const [chain, postChain] = parseIfStmt(lines, afterBlock, indentation, 'elif')

            return [
                {
                    type: 'if-statement',
                    condition: expression,
                    block,
                    elseBlock: chain,
                },
                postChain,
            ]
        }
    }

    return [
        {
            type: 'if-statement',
            condition: expression,
            block,
        },
        afterBlock,
    ]
}

const parseExpression = (lines: string[], tokens: MyToken[]): [Expression, MyToken[]] => {
    return parseCondOrExpr(lines, tokens)
}

const parseCondOrExpr = (lines: string[], tokens: MyToken[]): [CondOrExpr, MyToken[]] => {
    let andExpr: CondAndExpr | CondOrExpr, rest: MyToken[]

    [andExpr, rest] = parseCondAndExpr(lines, tokens)
    while (rest[0]?.type === 'keyword.python' && rest[0].text === 'or') {
        let right: Expression
        [right, rest] = parseCondAndExpr(lines, rest.slice(1))
        andExpr = {
            type: 'cond-or-expr',
            mode: 'or',
            leftOperand: andExpr,
            rightOperand: right,
        }
    }

    return [andExpr, rest]
}

const parseCondAndExpr = (lines: string[], tokens: MyToken[]): [CondAndExpr, MyToken[]] => {
    let equalityExpr: EqualityExpr | CondAndExpr, rest: MyToken[]

    [equalityExpr, rest] = parseEqualityExpr(lines, tokens)
    while (rest[0]?.type === 'keyword.python' && rest[0].text === 'and') {
        let right: Expression
        [right, rest] = parseEqualityExpr(lines, rest.slice(1))
        equalityExpr = {
            type: 'cond-and-expr',
            mode: 'and',
            leftOperand: equalityExpr,
            rightOperand: right,
        }
    }

    return [equalityExpr, rest]
}

const parseEqualityExpr = (lines: string[], tokens: MyToken[]): [EqualityExpr, MyToken[]] => {
    let andExpr: RelativeExpr | EqualityExpr, rest: MyToken[]

    [andExpr, rest] = parseRelExpr(lines, tokens)
    while (rest[0]?.type === '' && (rest[0].text === '==' || rest[0].text === '!=')) {
        const operator: '==' | '!=' = rest[0].text
        let right: Expression
        [right, rest] = parseRelExpr(lines, rest.slice(1))
        andExpr = {
            type: 'equality-expr',
            mode: operator,
            leftOperand: andExpr,
            rightOperand: right,
        }
    }

    return [andExpr, rest]
}

const isRelativeOperand = (text: string | undefined): text is '<' | '>' | '<=' | '>=' => {
    return text === '<' || text === '>' || text === '<=' || text === '>='
}

const parseRelExpr = (lines: string[], tokens: MyToken[]): [RelativeExpr, MyToken[]] => {
    let additiveExpr: AdditiveExpr | RelativeExpr
    let rest: MyToken[]

    [additiveExpr, rest] = parseAdditiveExpr(lines, tokens)
    while (rest[0]?.type === '' && isRelativeOperand(rest[0].text)) {
        const operator: '<' | '>' | '<=' | '>=' = rest[0].text

        let right: Expression
        [right, rest] = parseAdditiveExpr(lines, rest.slice(1))
        additiveExpr = {
            type: 'relative-expr',
            mode: operator,
            leftOperand: additiveExpr,
            rightOperand: right,
        }
    }

    return [additiveExpr, rest]
}

const isAdditiveOperand = (text: string | undefined): text is '+' | '-' => {
    return text === '+' || text === '-'
}

const parseAdditiveExpr = (lines: string[], tokens: MyToken[]): [AdditiveExpr, MyToken[]] => {
    let multExpr: MultiplicativeExpr | AdditiveExpr
    let rest: MyToken[]

    [multExpr, rest] = parseMultiplicativeExpr(lines, tokens)
    while (rest[0]?.type === '' && isAdditiveOperand(rest[0].text)) {
        const operator = rest[0].text
        let right: Expression
        [right, rest] = parseAdditiveExpr(lines, rest.slice(1))
        multExpr = {
            type: 'additive-expr',
            mode: operator as '+' | '-',
            leftOperand: multExpr,
            rightOperand: right,
        }
    }

    return [multExpr, rest]
}

const isMultiplicativeOperand = (text: string | undefined): text is '*' | '/' => {
    return text === '*' || text === '/'
}

const parseMultiplicativeExpr = (lines: string[], tokens: MyToken[]): [MultiplicativeExpr, MyToken[]] => {
    let unaryExpr: UnaryExpr | MultiplicativeExpr
    let rest: MyToken[]

    [unaryExpr, rest] = parseUnaryExpr(lines, tokens)
    while (rest[0]?.type === '' && isMultiplicativeOperand(rest[0].text)) {
        const operator = rest[0].text
        let right: MultiplicativeExpr
        [right, rest] = parseMultiplicativeExpr(lines, rest.slice(1))
        unaryExpr = {
            type: 'multiplicative-expr',
            mode: operator as '*' | '/',
            leftOperand: unaryExpr,
            rightOperand: right,
        }
    }

    return [unaryExpr, rest]
}

const parseUnaryExpr = (lines: string[], tokens: MyToken[]): [UnaryExpr, MyToken[]] => {
    if (tokens[0].type === 'keyword.python') {
        // TODO: + and - unary expressions
        if (tokens[0].text === 'not') {
            const [child, rest] = parseUnaryExpr(lines, tokens.slice(1))

            return [
                {
                    type: 'unary-expr',
                    expression: child,
                },
                rest,
            ]
        }
    }

    return parsePrimaryExpr(lines, tokens)
}

const parsePrimaryExpr = (lines: string[], tokens: MyToken[]): [PrimaryExpr, MyToken[]] => {
    if (tokens[0].type === 'delimiter.parenthesis.python') {
        if (tokens[0].text !== '(') {
            throw Error(`Undesired parenthesis ${tokens[0].lineNumber}:${tokens[0].offset}`)
        }

        const [child, rest] = parseExpression(lines, tokens.slice(1))

        if (!rest[0] || rest[0].type !== 'delimiter.parenthesis.python' || rest[0]?.text !== ')') {
            throw tokenError('Expected matching close paren', rest[0])
        }

        return [
            {
                type: 'primary-expr',
                expression: child,
            },
            rest.slice(1),
        ]
    } else if (tokens[0].type === 'number.python') {
        const num = tokens[0].text

        if (!num) {
            throw tokenError('Weird number token', tokens[0])
        }

        const numberValue = parseFloat(num)

        if (Number.isNaN(numberValue)) {
            throw tokenError('Weird number token value', tokens[0])
        }

        return [
            {
                type: 'numberliteral',
                value: numberValue,
            },
            tokens.slice(1),
        ]
    } else if (tokens[0].type === 'keyword.python' && ['True', 'False'].includes(tokens[0].text)) {
        const value = tokens[0].text === 'True'

        return [
            {
                type: 'booleanliteral',
                value,
            },
            tokens.slice(1),
        ]
    } else if (tokens[0].type === 'identifier.python' || tokens[0].type === 'keyword.python') {
        const name = parseIdentifier(lines, tokens[0])

        if (tokens[1]?.type === 'delimiter.parenthesis.python') {
            if (tokens[1].text !== '()') {
                throw tokenError('Handling arg-list, not ready for that', tokens[1])
            }

            return [
                {
                    type: 'call-expr',
                    identifier: name,
                    argList: [],
                },
                tokens.slice(2),
            ]
        } else {
            return [
                name,
                tokens.slice(1),
            ]
        }
    }

    console.log('Confused by', tokens[0], lines, lines[tokens[0].lineNumber].slice(tokens[0].offset))
    throw tokenError('Wtf primary expression', tokens[0])
}

const tokenError = (message: string, token: MyToken) => {
    return Error(`${message} ${token.lineNumber + 1}:${token.offset} '${token.text}'`)
}
