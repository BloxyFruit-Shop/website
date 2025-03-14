let id = 1

export const ID = () => id++
export const DEFAULT_OPTIONS = {
    closable: true,
    duration: 5000,
    infinite: false,
    rich: false
}
export const DEFAULT_ANIMATION = {
    start: 0.75,
    opacity: 0,
    duration: 150
}
export const parseDuration = (value) => {
    if (typeof value === 'number')
        return value
    if (!/ms|s$/.test(value))
        throw new Error('[SVoast] `duration` prop was given a string but not a leading identifier (ms/s).')
    const duration = parseFloat(value.split(/ms|s/)[0])
    if (/(?=ms)(?!s)/.test(value))
        return duration
    return duration * 1000
}
export const objectMerge = (original, newObject) => {
    return {
        ...original,
        ...newObject
    }
}