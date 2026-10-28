import { Settings } from './Settings'

class SiloSettingsC extends Settings {
    cost: number
    storeCap: number
    transferRate: number
    sellFraction: number
    payloadTime: number
    
    constructor() {
        super('Silo')
        this.cost = 1
        this.storeCap = 100_000
        this.transferRate = 2
        this.sellFraction = 0.1
        this.payloadTime = 3_000
    }
}

export const SiloSettings = new SiloSettingsC()
