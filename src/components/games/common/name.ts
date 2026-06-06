export const defaultName = () => `User ${Math.floor(Math.random() * 1000)}`

export const loadName = () => {
    const loadedName = localStorage.getItem('user-name')

    if (loadedName) {
        return loadedName
    }

    const newName = defaultName()
    localStorage.setItem('user-name', newName)
    return newName
}
