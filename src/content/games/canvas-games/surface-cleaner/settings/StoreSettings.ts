import { Settings } from './Settings'

class StoreSettingsC extends Settings {
	cost: number

	constructor() {
		super('Store')
		this.cost = 10
	}
}

export const StoreSettings = new StoreSettingsC()
