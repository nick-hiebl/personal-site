import { Settings } from './Settings'

class RobotSettingsC extends Settings {
    cost: number

    constructor() {
        super('Robot')
        this.cost = 0.1
    }
}

export const RobotSettings = new RobotSettingsC()
