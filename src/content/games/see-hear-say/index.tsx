import { CoreGameLobby } from '../../../components/games/common/CoreGameLobby'
import { LobbyBrowser } from '../../../components/games/common/LobbyBrowser'
import { SeeHearSay } from './game'
import { GAME_ACTIVITY, type GameActivity } from './game/constants'

type RoomProps = {
    numUsers: number
}

export const Game = () => {
    return (
        <CoreGameLobby
            activity="see-hear-say"
            title={<h1>See, Hear, Say!</h1>}
            lobbyBrowser={
                <LobbyBrowser<RoomProps, GameActivity> activityData={GAME_ACTIVITY}>
                    {(id, details) => (
                        <div>
                            {id}. Num users: {details.numUsers}
                            {' '}
                            <a href={`#${id}`}>Join</a>
                        </div>
                    )}
                </LobbyBrowser>
            }
            game={({ onLobbyNotFound, lobby }) => (
                <SeeHearSay onLobbyNotFound={onLobbyNotFound} code={lobby} />
            )}
        />
    )
}
