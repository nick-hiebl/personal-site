import { createContext, useContext } from 'react'
import type { Socket } from 'socket.io-client'

import type { GameSettings, Output } from './types'

type EverythingProps = {
  output: Output
  settings: GameSettings | undefined
  socket: Socket
}

export const GameContext = createContext<EverythingProps | null>(null)

export const useGameContext = (): EverythingProps => {
  const context = useContext(GameContext)

  if (!context) {
    throw new Error('Could not find context')
  }

  return context
}
