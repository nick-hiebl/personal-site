import { IncDecNumber } from '../../../../../components/games/common/IncDecNumber'
import { useGameContext } from '../context'
import type { GameSettings, ModuleId } from '../types'

const PUZZLES: ModuleId[] = ['wire', 'direction', 'symbol']

const PUZZLE_NAMES: Record<ModuleId, string> = {
    wire: 'Wire module',
    direction: 'Direction module',
    symbol: 'Symbol module',
}

export const Settings = () => {
    const { socket, output: { settings } } = useGameContext()

    const onSettingsChange = (newSettings: Partial<GameSettings>) => {
        socket.emit('settings', {
            settings: {
                ...settings,
                ...newSettings,
            },
        })
    }

    return (
        <section className="column gap-8px">
            <label className="row-center gap-8px">
                <input
                    type="checkbox"
                    onChange={event => {
                        onSettingsChange({
                            freeRoleSwitching: event.target.checked,
                        })
                    }}
                    checked={settings.freeRoleSwitching}
                />
                Free role switching?
            </label>
            <label className="row-center gap-8px">
                <IncDecNumber
                    value={settings.maxLives}
                    onChange={(value) => {
                        onSettingsChange({ maxLives: value })
                    }}
                    min={1}
                    max={5}
                />
                Lives
            </label>
            <label className="row-center gap-8px">
                <IncDecNumber
                    value={settings.maxTime}
                    onChange={(value) => {
                        onSettingsChange({ maxTime: value })
                    }}
                    step={30}
                    min={60}
                    max={600}
                />
                Time
            </label>
            <ul className="column gap-8px">
                {PUZZLES.map(moduleId => (
                    <li key={moduleId}>
                        <label className="row-center gap-8px">
                            <IncDecNumber
                                value={settings.modules.filter(v => v === moduleId).length}
                                onChange={(value) => {
                                    onSettingsChange({
                                        modules: settings.modules
                                            .filter(v => v !== moduleId)
                                            .concat(new Array(value).fill(moduleId)),
                                    })
                                }}
                                min={0}
                                max={5}
                            />
                            {PUZZLE_NAMES[moduleId]}
                        </label>
                    </li>
                ))}
            </ul>
        </section>
    )
}
