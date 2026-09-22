export const GAME_ACTIVITY = {
    activity: 'see-hear-say' as const,
}

export type GameActivity = typeof GAME_ACTIVITY

export const SEE_HEAR_SAY_PASSWORD = 'saved-password::see-hear-say'
