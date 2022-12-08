import { isChrome } from './browsers';
export function preventScrollByWheelClick(el) {
    if (!isChrome()) {
        return;
    }
    el.addEventListener('mousedown', function (e) {
        if (e.button === 1 /* Middle */) {
            // prevent incorrect scrolling event
            e.preventDefault();
            return false;
        }
        return undefined;
    });
}
