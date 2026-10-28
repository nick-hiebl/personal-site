import { Settings } from './Settings'

class RobotSettingsC extends Settings {
    cost: number
    radius: number
    storeCap: number
    speed: number
    minPayload: number

    constructor() {
        super('Robot')
        this.cost = 1
        this.radius = 8
        this.storeCap = 20_000
        this.speed = 150
        this.minPayload = 5_000
    }
}

export const RobotSettings = new RobotSettingsC()
