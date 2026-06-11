import { Grid } from '../components/Grid'
import { PlayerList } from '../components/PlayerList'
import { ReadyUp } from '../components/ReadyUp'
// import { SetName } from '../components/SetName'
import { useGameContext } from '../context'
import type { ActiveOutput } from '../types'

type Props = {
    state: ActiveOutput
}

export const ActiveGame = ({ state }: Props) => {
    const { output: { yourId } } = useGameContext()
    return (
        <div className="stack gap-8px">
            <PlayerList />
            <div className="stack gap-16px">
                <div className="stack stack-center gap-8px">
                    {/* <SetName /> */}
                    {/* <ReadyUp /> */}
                    <div>Your grids</div>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId === yourId).map(grid => (
                            <li key={grid.id}>
                                <Grid grid={grid} hideName />
                            </li>
                        ))}
                    </ul>
                    <div>Others' grids</div>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId !== yourId).map(grid => (
                            <li key={grid.id}>
                                <Grid grid={grid} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
