import type { Token } from 'monaco-editor'

type MyToken = Token & {
    lineNumber: number
    text: string
}

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

export type Statement =
    | FuncDeclStatement
    | WhileStatement
    | ForStatement
    | IfStatement
    | ExprStatement
    | AssignmentStatement
    | BreakStatement
    | ReturnStatement

export type FuncDeclStatement = {
    type: 'func-decl'
    name: Identifier
    parameterList: Identifier[]
    block: BlockStatement
}

export type WhileStatement = {
    type: 'while-statement'
    condition: Expression
    block: BlockStatement
}

export type ForStatement = {
    type: 'for-statement'
    identifier: Identifier
    generator: Expression
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
}
export type AssignmentStatement = {
    type: 'assignment-statement'
    identifier: Identifier
    assignmentType: '=' | '+=' | '-=' | '*=' | '/=' | '%='
    expression: Expression
}

export type BreakStatement = {
    type: 'break-statement'
}

export type ReturnStatement = {
    type: 'return-statement'
    value?: Expression
}

export type BinaryExpr<T extends string, Operators> = {
    type: T
    mode: Operators
    leftOperand: Expression
    rightOperand: Expression
}

export type Expression = CondOrExpr
export type CondOrExpr = CondAndExpr
    | BinaryExpr<'cond-or-expr', 'or'>
export type CondAndExpr = EqualityExpr
    | BinaryExpr<'cond-and-expr', 'and'>
export type EqualityExpr = RelativeExpr
    | BinaryExpr<'equality-expr', '==' | '!='>
export type RelativeExpr = AdditiveExpr
    | BinaryExpr<'relative-expr', '<' | '>' | '<=' | '>='>

export type AdditiveExpr = MultiplicativeExpr
    | BinaryExpr<'additive-expr', '+' | '-'>
export type MultiplicativeExpr = UnaryExpr
    | BinaryExpr<'multiplicative-expr', '*' | '/' | '%'>

export type UnaryExpr = PrimaryExpr
    | {
        type: 'unary-expr'
        unaryOperation: '-' | '+' | 'not'
        expression: UnaryExpr
    }
export type PrimaryExpr = Identifier
    | { type: 'numberliteral', value: number }
    | { type: 'booleanliteral', value: boolean }
    // "(" expression ")"
    | { type: 'primary-expr', expression: Expression }
    | { type: 'call-expr', identifier: Identifier, argList: Expression[] }

export const parseProgram = (tokens: MyToken[]): ProgramTree => {
    const [block, afterTokens] = parseBlockStatement(tokens, 0)

    if (afterTokens.length > 0) {
        console.warn('Found leftover tokens after program block!', afterTokens)
    }

    return {
        type: 'program',
        block,
    }
}

const parseBlockStatement = (tokens: MyToken[], indentation: number): [BlockStatement, MyToken[]] => {
    const firstLefterTokenIndex = tokens.findIndex(token => {
        return token.type !== 'white.python' && token.offset < indentation
    })

    const blockTokens = tokens.slice(0, firstLefterTokenIndex === -1 ? undefined : firstLefterTokenIndex)

    const statements: Statement[] = []

    if (blockTokens.length > 0) {
        let [nextStatement, remaining] = parseStatement(blockTokens, indentation)
        if (nextStatement) {
            statements.push(nextStatement)
        }
    
        while (remaining.length > 0) {
            [nextStatement, remaining] = parseStatement(remaining, indentation)
            
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

const parseIdentifier = (token: MyToken): Identifier => {
    if (!token.text) {
        throw tokenError('Could not find identifier when parsing line:', token)
    }

    return {
        type: 'identifier',
        value: token.text,
    }
}

const SOME_TEXT_REGEX = /[^\s]+/

export const parseText = (lines: string[], token: MyToken, nextToken: MyToken | undefined): string | undefined => {
    const endOffset = nextToken?.lineNumber === token.lineNumber
        ? nextToken.offset
        : undefined

    if (token.type === 'string.python') {
        return lines[token.lineNumber].slice(token.offset, endOffset)
    }

    const textToSearch = lines[token.lineNumber].slice(token.offset, endOffset)
    const match = SOME_TEXT_REGEX.exec(textToSearch)

    if (!match) {
        return undefined
    }

    return match[0] || undefined
}

const isAssignmentOperator = (text?: string): text is AssignmentStatement['assignmentType'] => {
    return !!text && ['=', '+=', '-=', '*=', '/=', '%='].includes(text)
}

const parseStatement = (tokens: MyToken[], indentation: number): [Statement | undefined, MyToken[]] => {
    if (tokens[0].type === 'keyword.python') {
        if (tokens[0].text === 'def') {
            return parseFuncDecl(tokens, indentation)
        } else if (tokens[0].text === 'while') {
            return parseWhileStmt(tokens, indentation)
        } else if (tokens[0].text === 'for') {
            return parseForStmt(tokens, indentation)
        } else if (tokens[0].text === 'if') {
            return parseIfStmt(tokens, indentation, 'if')
        } else if (tokens[0].text === 'break') {
            if (tokens.length > 1) {
                throw tokenError('Expected break statement to be only part of statement', tokens[0])
            }

            return [{ type: 'break-statement' }, []]
        } else if (tokens[0].text === 'return') {
            if (tokens.length > 1) {
                const [value, rest] = parseExpression(tokens.slice(1))

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
        console.log('First token', firstToken, tokens)
        throw tokenError(`Bad indentation. Expected ${indentation}, got`, firstToken)
    }

    const postLineIndex = tokens.findIndex((token) => token.lineNumber > firstToken.lineNumber)

    if (firstToken.type === 'identifier.python') {
        const assignmentName = parseIdentifier(firstToken)
        if (assignmentName && tokens[1]?.type === '') {
            if (isAssignmentOperator(tokens[1]?.text)) {
                const [childExpression, extraTokens] = parseExpression(tokens.slice(2, postLineIndex === -1 ? undefined : postLineIndex))

                if (extraTokens.length > 0) {
                    throw tokenError('Extra tokens after assignment???', extraTokens[0])
                }

                return [
                    {
                        type: 'assignment-statement',
                        identifier: assignmentName,
                        assignmentType: tokens[1].text,
                        expression: childExpression,
                    },
                    postLineIndex === -1
                        ? []
                        : tokens.slice(postLineIndex),
                ]
            }
        }
    }

    const [childExpression, extraTokens] = parseExpression(tokens.slice(0, postLineIndex === -1 ? undefined : postLineIndex))

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

const parseFuncDecl = (tokens: MyToken[], indentation: number): [FuncDeclStatement, MyToken[]] => {
    if (tokens[0]?.type !== 'keyword.python') {
        throw Error('Parsing function declaration not starting with def')
    }

    const ident = parseIdentifier(tokens[0])

    if (ident.value !== 'def') {
        throw Error('Keyword in function declaration not def??')
    }

    const nameToken = tokens[1]

    if (!nameToken || nameToken.type !== 'identifier.python') {
        throw Error('No name for this function declaration!')
    }

    const nameIdent = parseIdentifier(nameToken)

    const [parameterList, remaining] = parseIdentifierList(tokens.slice(2))

    const colon = remaining[0]
    if (!colon || colon.type !== 'delimiter.python') {
        throw Error('No colon on function declaration')
    }

    const [block, afterBlock] = parseBlockStatement(remaining.slice(1), indentation + 4)

    return [
        {
            type: 'func-decl',
            name: nameIdent,
            parameterList,
            block,
        },
        afterBlock,
    ]
}

const parseWhileStmt = (tokens: MyToken[], indentation: number): [WhileStatement, MyToken[]] => {
    if (tokens[0]?.type !== 'keyword.python' || tokens[0].text !== 'while') {
        throw tokenError(`Expected 'while' at`, tokens[0])
    }

    const [expression, rest] = parseExpression(tokens.slice(1))

    const colon = rest[0]
    if (!colon || colon.type !== 'delimiter.python') {
        throw tokenError('Expected colon in while statement at', colon)
    }

    const [block, afterBlock] = parseBlockStatement(rest.slice(1), indentation + 4)

    return [
        {
            type: 'while-statement',
            condition: expression,
            block,
        },
        afterBlock,
    ]
}

const parseForStmt = (tokens: MyToken[], indentation: number): [ForStatement, MyToken[]] => {
    if (tokens[0]?.type !== 'keyword.python' || tokens[0].text !== 'for') {
        throw tokenError(`Expected 'for' at`, tokens[0])
    }

    const identifier = parseIdentifier(tokens[1])

    const inWord = tokens[2]
    if (!inWord || inWord.type !== 'keyword.python' || inWord.text !== 'in') {
        throw tokenError(`Expected 'in' as part of for loop`, tokens[2])
    }

    const [generator, afterGenerator] = parseExpression(tokens.slice(3))

    const colon = afterGenerator[0]
    if (!colon || colon.type !== 'delimiter.python') {
        throw tokenError('Expected colon as part of for loop', colon)
    }

    const [block, afterBlock] = parseBlockStatement(afterGenerator.slice(1), indentation + 4)

    return [
        {
            type: 'for-statement',
            identifier,
            generator,
            block,
        },
        afterBlock,
    ]
}

const parseIfStmt = (tokens: MyToken[], indentation: number, expecting: 'if' | 'elif'): [IfStatement, MyToken[]] => {
    if (tokens[0]?.type !== 'keyword.python') {
        throw tokenError(`Expected '${expecting}' at`, tokens[0])
    }

    if (tokens[0].text !== expecting) {
        throw tokenError(`Expected '${expecting}' at`, tokens[0])
    }

    const [expression, rest] = parseExpression(tokens.slice(1))

    const colon = rest[0]
    if (!colon || colon.type !== 'delimiter.python') {
        throw tokenError('Expected colon in if statement at', colon)
    }

    const [block, afterBlock] = parseBlockStatement(rest.slice(1), indentation + 4)

    let elseBlock: IfStatement

    if (afterBlock[0]?.type === 'keyword.python') {
        if (afterBlock[0].text === 'else') {
            if (afterBlock[1]?.type !== 'delimiter.python') {
                throw tokenError('Expected colon in else statement at', afterBlock[1])
            }
            const [elseBlock, postElse] = parseBlockStatement(afterBlock.slice(2), indentation + 4)

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
            const [chain, postChain] = parseIfStmt(afterBlock, indentation, 'elif')

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

const parseExpression = (tokens: MyToken[]): [Expression, MyToken[]] => {
    return parseCondOrExpr(tokens)
}

const parseCondOrExpr = (tokens: MyToken[]): [CondOrExpr, MyToken[]] => {
    let andExpr: CondAndExpr | CondOrExpr, rest: MyToken[]

    [andExpr, rest] = parseCondAndExpr(tokens)
    while (rest[0]?.type === 'keyword.python' && rest[0].text === 'or') {
        let right: Expression
        [right, rest] = parseCondAndExpr(rest.slice(1))
        andExpr = {
            type: 'cond-or-expr',
            mode: 'or',
            leftOperand: andExpr,
            rightOperand: right,
        }
    }

    return [andExpr, rest]
}

const parseCondAndExpr = (tokens: MyToken[]): [CondAndExpr, MyToken[]] => {
    let equalityExpr: EqualityExpr | CondAndExpr, rest: MyToken[]

    [equalityExpr, rest] = parseEqualityExpr(tokens)
    while (rest[0]?.type === 'keyword.python' && rest[0].text === 'and') {
        let right: Expression
        [right, rest] = parseEqualityExpr(rest.slice(1))
        equalityExpr = {
            type: 'cond-and-expr',
            mode: 'and',
            leftOperand: equalityExpr,
            rightOperand: right,
        }
    }

    return [equalityExpr, rest]
}

const parseEqualityExpr = (tokens: MyToken[]): [EqualityExpr, MyToken[]] => {
    let andExpr: RelativeExpr | EqualityExpr, rest: MyToken[]

    [andExpr, rest] = parseRelExpr(tokens)
    while (rest[0]?.type === '' && (rest[0].text === '==' || rest[0].text === '!=')) {
        const operator: '==' | '!=' = rest[0].text
        let right: Expression
        [right, rest] = parseRelExpr(rest.slice(1))
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

const parseRelExpr = (tokens: MyToken[]): [RelativeExpr, MyToken[]] => {
    let additiveExpr: AdditiveExpr | RelativeExpr
    let rest: MyToken[]

    [additiveExpr, rest] = parseAdditiveExpr(tokens)
    while (rest[0]?.type === '' && isRelativeOperand(rest[0].text)) {
        const operator: '<' | '>' | '<=' | '>=' = rest[0].text

        let right: Expression
        [right, rest] = parseAdditiveExpr(rest.slice(1))
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

const parseAdditiveExpr = (tokens: MyToken[]): [AdditiveExpr, MyToken[]] => {
    let multExpr: MultiplicativeExpr | AdditiveExpr
    let rest: MyToken[]

    [multExpr, rest] = parseMultiplicativeExpr(tokens)
    while (rest[0]?.type === '' && isAdditiveOperand(rest[0].text)) {
        const operator = rest[0].text
        let right: Expression
        [right, rest] = parseAdditiveExpr(rest.slice(1))
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
    return text === '*' || text === '/' || text === '%'
}

const parseMultiplicativeExpr = (tokens: MyToken[]): [MultiplicativeExpr, MyToken[]] => {
    let unaryExpr: UnaryExpr | MultiplicativeExpr
    let rest: MyToken[]

    [unaryExpr, rest] = parseUnaryExpr(tokens)
    while (rest[0]?.type === '' && isMultiplicativeOperand(rest[0].text)) {
        const operator = rest[0].text
        let right: MultiplicativeExpr
        [right, rest] = parseMultiplicativeExpr(rest.slice(1))
        unaryExpr = {
            type: 'multiplicative-expr',
            mode: operator,
            leftOperand: unaryExpr,
            rightOperand: right,
        }
    }

    return [unaryExpr, rest]
}

const parseUnaryExpr = (tokens: MyToken[]): [UnaryExpr, MyToken[]] => {
    if (tokens[0].type === 'keyword.python') {
        // TODO: + and - unary expressions
        if (tokens[0].text === 'not') {
            const [child, rest] = parseUnaryExpr(tokens.slice(1))

            return [
                {
                    type: 'unary-expr',
                    unaryOperation: 'not',
                    expression: child,
                },
                rest,
            ]
        }
    } else if (tokens[0].type === '' && (tokens[0].text === '+' || tokens[0].text === '-')) {
        const [child, rest] = parseUnaryExpr(tokens.slice(1))

        return [
            {
                type: 'unary-expr',
                unaryOperation: tokens[0].text,
                expression: child,
            },
            rest,
        ]
    }

    return parsePrimaryExpr(tokens)
}

const parsePrimaryExpr = (tokens: MyToken[]): [PrimaryExpr, MyToken[]] => {
    if (tokens[0].type === 'delimiter.parenthesis.python') {
        if (tokens[0].text !== '(') {
            throw Error(`Undesired parenthesis ${tokens[0].lineNumber}:${tokens[0].offset}`)
        }

        const [child, rest] = parseExpression(tokens.slice(1))

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
        const name = parseIdentifier(tokens[0])

        if (tokens[1]?.type === 'delimiter.parenthesis.python' && tokens[1].text !== ')') {
            if (tokens[1].text === '(' || tokens[1].text === '()') {
                const [argList, remainder] = parseArgList(tokens.slice(1))

                return [
                    {
                        type: 'call-expr',
                        identifier: name,
                        argList,
                    },
                    remainder,
                ]
            } else {
                throw tokenError('Got unexpected parenthesis pattern', tokens[1])
            }
        } else {
            return [
                name,
                tokens.slice(1),
            ]
        }
    }

    console.log('Confused by', tokens[0])
    throw tokenError('Wtf primary expression', tokens[0])
}

const parseArgList = (tokens: MyToken[]): [Expression[], MyToken[]] => {
    if (tokens[0]?.type !== 'delimiter.parenthesis.python') {
        throw tokenError('Expected parenthesis on argList', tokens[0])
    }

    if (tokens[0].text === '()') {
        return [[], tokens.slice(1)]
    }

    if (tokens[0].text !== '(') {
        throw tokenError(`Expected '(' at start of arg-list`, tokens[0])
    }

    const argumentList = []

    let remaining = tokens.slice(1)

    while (remaining[0].text !== ')') {
        const [newArgument, afterArgument] = parseExpression(remaining)

        argumentList.push(newArgument)

        if (afterArgument[0].text === ',') {
            remaining = afterArgument.slice(1)
        } else {
            remaining = afterArgument
        }
    }

    return [argumentList, remaining.slice(1)]
}

const parseIdentifierList = (tokens: MyToken[]): [Identifier[], MyToken[]] => {
    if (tokens[0]?.type !== 'delimiter.parenthesis.python') {
        throw tokenError('Expected parenthesis on identifierList', tokens[0])
    }

    if (tokens[0].text === '()') {
        return [[], tokens.slice(1)]
    }

    if (tokens[0].text !== '(') {
        throw tokenError(`Expected '(' at the start of identifierList`, tokens[0])
    }

    const identifiers: Identifier[] = []

    let remaining = tokens.slice(1)

    while (remaining[0].text !== ')') {
        const iden = parseIdentifier(remaining[0])

        identifiers.push(iden)

        if (remaining[1].text === ',') {
            remaining = remaining.slice(2)
        } else {
            remaining = remaining.slice(1)
        }
    }

    return [
        identifiers,
        remaining.slice(1),
    ]
}

const tokenError = (message: string, token: MyToken | undefined) => {
    return Error(`${message} ${(token?.lineNumber ?? 0) + 1}:${token?.offset} '${token?.text}'`)
}
