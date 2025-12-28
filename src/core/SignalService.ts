import { Signal } from "micro-signals";

const signals: any = {};
const show = ["boolean", "string", "number"];

function getSignal(name: string) {
    return signals[name] = signals[name] || new Signal();
}
type SignalHandler<T = any> = (payload: T) => void;


export const signal = {
    dispatch,
    off,
    on,
    once,
    promise,
};

function on<T = any>(name: string, handler: SignalHandler<T>) {
  getSignal(name).add(handler);
}

function once<T = any>(name: string, handler: SignalHandler<T>) {
  getSignal(name).addOnce(handler);
}

function off<T = any>(name: string, handler: SignalHandler<T>) {
  getSignal(name).remove(handler);
}


function promise(name: string) {
    return new Promise((resolve) => once(name, resolve));
}

function dispatch(name: string, payload: any) {
    const details = show.includes(typeof payload) ? ` => ${payload}` : "";
    const [type] = name.split(":");
    console.log(`${name}${details}`, type);
    getSignal(name).dispatch(payload);
}
