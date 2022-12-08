// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function merge(dst) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
        var src = sources_1[_a];
        // eslint-disable-next-line no-restricted-syntax
        for (var i in src) {
            if (src[i] === undefined) {
                continue;
            }
            if ('object' !== typeof src[i] || dst[i] === undefined) {
                dst[i] = src[i];
            }
            else {
                merge(dst[i], src[i]);
            }
        }
    }
    return dst;
}
export function isNumber(value) {
    return (typeof value === 'number') && (isFinite(value));
}
export function isInteger(value) {
    return (typeof value === 'number') && ((value % 1) === 0);
}
export function isString(value) {
    return typeof value === 'string';
}
export function isBoolean(value) {
    return typeof value === 'boolean';
}
export function clone(object) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var o = object;
    if (!o || 'object' !== typeof o) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return o;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var c;
    if (Array.isArray(o)) {
        c = [];
    }
    else {
        c = {};
    }
    var p;
    var v;
    // eslint-disable-next-line no-restricted-syntax
    for (p in o) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,no-prototype-builtins
        if (o.hasOwnProperty(p)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            v = o[p];
            if (v && 'object' === typeof v) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                c[p] = clone(v);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                c[p] = v;
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return c;
}
export function notNull(t) {
    return t !== null;
}
export function undefinedIfNull(t) {
    return (t === null) ? undefined : t;
}
