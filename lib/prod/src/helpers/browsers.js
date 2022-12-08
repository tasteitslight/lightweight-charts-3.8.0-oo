import { isRunningOnClientSide } from './is-running-on-client-side';
export function isFF() {
    if (!isRunningOnClientSide) {
        return false;
    }
    return window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}
export function isIOS() {
    if (!isRunningOnClientSide) {
        return false;
    }
    // eslint-disable-next-line deprecation/deprecation
    return /iPhone|iPad|iPod/.test(window.navigator.platform);
}
export function isChrome() {
    if (!isRunningOnClientSide) {
        return false;
    }
    return window.chrome !== undefined;
}
