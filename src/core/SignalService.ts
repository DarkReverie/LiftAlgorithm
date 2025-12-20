import { Signal } from 'micro-signals'

const signals: any = {}
const show = ['boolean', 'string', 'number']

function getSignal(name: string) {
    return signals[name] = signals[name] || new Signal()
}

export const signal = {
    dispatch,
    off,
    on,
    once,
    promise,
}

function once(name: string, handler: Function) {
        getSignal(name).addOnce(handler)
}

function on(name: string, handler: Function) {
        getSignal(name).add(handler)
}

function promise(name: string) {
    return new Promise((resolve) => once(name, resolve))
}

function off(name: string, handler: Function) {
    getSignal(name).remove(handler)
}

function dispatch(name: string, payload: any) {
    const details = show.includes(typeof payload) ? ` => ${payload}` : ''
    const [type] = name.split(':')
    console.log(`${name}${details}`, type)
    getSignal(name).dispatch(payload)
}
