import { Settings } from './Settings'

class RobotSettingsC extends Settings {
    cost: number
    radius: number
    storeCap: number
    speed: number

    constructor() {
        super('Robot')
        this.cost = 1
        this.radius = 8
        this.storeCap = 50_000
        this.speed = 150
    }
}

export const RobotSettings = new RobotSettingsC()
