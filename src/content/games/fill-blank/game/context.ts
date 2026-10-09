import { createContext, useContext } from 'react'
import type { Socket } from 'socket.io-client'

import type { Output } from './types'

type EverythingProps = {
  output: Output
  socket: Socket
  isReadOnly: boolean
}

export const GameContext = createContext<EverythingProps | null>(null)

export const useGameContext = (): EverythingProps => {
  const context = useContext(GameContext)

  if (!context) {
    throw new Error('Could not find context')
  }

  return context
}
