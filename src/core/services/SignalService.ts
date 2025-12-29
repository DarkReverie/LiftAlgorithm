import { Signal } from "micro-signals";

const signals: any = {};

function getSignal(name: string) {
  return (signals[name] = signals[name] || new Signal());
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
  getSignal(name).dispatch(payload);
}
