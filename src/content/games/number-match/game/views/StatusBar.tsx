import { useGameContext } from '../context'

export const StatusBar = () => {
    const { output } = useGameContext()

    if (output.state.state === 'pending') {
        return (
            <div id="core-bar">
                Waiting to start
            </div>
        )
    } else if (output.state.state === 'complete') {
        return (
            <div id="core-bar">
                Game complete
            </div>
        )
    }

    const action = output.state.action

    if (action.type === 'claim') {
        return (
            <div id="core-bar">
                Waiting for everyone to claim their sets
            </div>
        )
    } else if (action.type === 'tag') {
        if (action.users.includes(output.yourId)) {
            return (
                <div id="core-bar">
                    Tag one of your squares
                </div>
            )
        } else {
            return (
                <div id="core-bar">
                    Waiting for others add tags
                </div>
            )
        }
    } else if (action.type === 'guess') {
        if (action.user === output.yourId) {
            return (
                <div id="core-bar">
                    Your turn!
                </div>
            )
        } else {
            const player = output.players.find(p => p.id === action.user)

            return (
                <div id="core-bar">
                    {player?.name ?? 'Disconnected player'}'s turn
                </div>
            )
        }
    }

    return (
        <div id="core-bar">
            Number match game
        </div>
    )
}