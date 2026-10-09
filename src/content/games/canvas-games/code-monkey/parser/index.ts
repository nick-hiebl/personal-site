import type { Token } from 'monaco-editor'

type MyToken = Token & {
    lineNumber: number
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

export type Statement = ExprStatement | FuncDeclStatement

export type FuncDeclStatement = {
    type: 'func-decl'
    name: Identifier
    block: BlockStatement
}

export type ExprStatement = {
    type: 'expression-statement'
    expression: Expression
} | {
    type: 'assignment-statement'
    identifier: Identifier
    expression: Expression
}

export type Expression = AdditiveExpr
export type AdditiveExpr = MultiplicativeExpr
    | {
        type: 'additive-expr'
        mode: '+' | '-'
        leftOperand: AdditiveExpr
        rightOperand: AdditiveExpr
    }
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

const parseText = (lines: string[], token: MyToken, nextToken: MyToken | undefined): string | undefined => {
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
        const ident = parseIdentifier(lines, tokens[0])

        if (ident.value === 'def') {
            return parseFuncDecl(lines, tokens, indentation)
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
            const follow = parseText(lines, tokens[1], tokens[2])

            if (follow === '=') {
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
    if (tokens[0].type !== 'keyword.python') {
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

const parseExpression = (lines: string[], tokens: MyToken[]): [Expression, MyToken[]] => {
    return parseAdditiveExpr(lines, tokens)
}

const isAdditiveOperand = (text: string | undefined): text is '+' | '-' => {
    return text === '+' || text === '-'
}

const parseAdditiveExpr = (lines: string[], tokens: MyToken[]): [AdditiveExpr, MyToken[]] => {
    let multExpr: MultiplicativeExpr | AdditiveExpr
    let rest: MyToken[]

    [multExpr, rest] = parseMultiplicativeExpr(lines, tokens)
    while (rest[0]?.type === '' && isAdditiveOperand(parseText(lines, rest[0], rest[1]))) {
        const operator = parseText(lines, rest[0], rest[1])!
        let right: AdditiveExpr
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
    while (rest[0]?.type === '' && isMultiplicativeOperand(parseText(lines, rest[0], rest[1]))) {
        const operator = parseText(lines, rest[0], rest[1])!
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
        if (parseText(lines, tokens[0], tokens[1]) === 'not') {
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
        const t = parseText(lines, tokens[0], tokens[1])

        if (t !== '(') {
            throw Error(`Undesired parenthesis ${tokens[0].lineNumber}:${tokens[0].offset}`)
        }

        const [child, rest] = parseExpression(lines, tokens.slice(1))

        if (!rest[0] || rest[0].type !== 'delimiter.parenthesis.python' || parseText(lines, rest[0], rest[1]) !== ')') {
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
        const num = parseText(lines, tokens[0], tokens[1])

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
    } else if (tokens[0].type === 'keyword.python' && ['True', 'False'].includes(parseText(lines, tokens[0], tokens[1]) ?? '')) {
        const value = parseText(lines, tokens[0], tokens[1]) === 'True'

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
            const text = parseText(lines, tokens[1], tokens[2])

            if (text !== '()') {
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

    console.log('ppp', parseText(lines, tokens[0], tokens[1]))

    console.log('Confused by', tokens[0], lines, lines[tokens[0].lineNumber].slice(tokens[0].offset))
    throw tokenError('Wtf primary expression', tokens[0])
}

const tokenError = (message: string, token: MyToken) => {
    return Error(`${message} ${token.lineNumber + 1}:${token.offset}`)
}
