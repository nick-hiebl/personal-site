export const setStorageSetting = (key: string, enabled: boolean) => {
    try {
        if (enabled) {
            localStorage.setItem(key, 'true')
        } else {
            localStorage.removeItem(key)
        }
    } catch {
        return
    }
}

export const getStorageSetting = (key: string, defaultValue: boolean): boolean => {
    try {
        return localStorage.getItem(key) === 'true'
    } catch {
        return defaultValue
    }
}
