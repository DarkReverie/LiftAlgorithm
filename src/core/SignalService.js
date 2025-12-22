"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signal = void 0;
const micro_signals_1 = require("micro-signals");
const signals = {};
const show = ['boolean', 'string', 'number'];
function getSignal(name) {
    return signals[name] = signals[name] || new micro_signals_1.Signal();
}
exports.signal = {
    dispatch,
    off,
    on,
    once,
    promise,
};
function once(name, handler) {
    getSignal(name).addOnce(handler);
}
function on(name, handler) {
    getSignal(name).add(handler);
}
function promise(name) {
    return new Promise((resolve) => once(name, resolve));
}
function off(name, handler) {
    getSignal(name).remove(handler);
}
function dispatch(name, payload) {
    const details = show.includes(typeof payload) ? ` => ${payload}` : '';
    const [type] = name.split(':');
    console.log(`${name}${details}`, type);
    getSignal(name).dispatch(payload);
}
