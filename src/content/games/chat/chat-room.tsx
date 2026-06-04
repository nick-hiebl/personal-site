import { useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

const useSocket = () => {
    const [socket, setSocket] = useState<Socket>()

    useEffect(() => {
        setSocket(io('http://localhost:3000'))
    }, [])

    return socket
}

type Message = {
    timestamp: string
    message: string
    author: string
}

export const ChatRoom = () => {
    const socket = useSocket()

    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')

    useEffect(() => {
        if (!socket) {
            return
        }

        const onSendMessages = (args: { messages: Message[] }) => {
            console.log('Received content:', args)
            setMessages(current => current.concat(args.messages))
        }

        socket.on('send-messages', onSendMessages)

        return () => {
            socket.off('send-messages', onSendMessages)
        }
    }, [socket])

    return (
        <section>
            <h1>Chat!</h1>
            <div>
                <ul>
                    {messages.map((message, index) => (
                        <li key={index}>
                            <span>[{new Date(message.timestamp).toLocaleTimeString()}]</span>
                            <span>&lt;@{message.author}&gt;</span>
                            <span>{message.message}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <input type="text" value={input} onChange={e => setInput(e.currentTarget.value)} />
            <button
                onClick={() => {
                    if (!socket) {
                        return
                    }

                    socket.emit('message', { message: input })
                    setMessages(current => current.concat({ message: input, author: socket.id ?? 'Me', timestamp: new Date().toISOString() }))
                }}
            >
                Send
            </button>
        </section>
    )
}
