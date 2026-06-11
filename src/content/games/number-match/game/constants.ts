export const GAME_ACTIVITY = {
    activity: 'number-match' as const,
}

export type GameActivity = typeof GAME_ACTIVITY

export const NUMBER_MATCH_PASSWORD = 'saved-password::number-match'
