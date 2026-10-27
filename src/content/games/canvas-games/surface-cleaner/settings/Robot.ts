import { Settings } from './Settings'

class RobotSettingsC extends Settings {
    cost: number
    radius: number
    storeCap: number
    speed: number

    constructor() {
        super('Robot')
        this.cost = 0.1
        this.radius = 18 // 8
        this.storeCap = 1_000_000
        this.speed = 300 // 150
    }
}

export const RobotSettings = new RobotSettingsC()
