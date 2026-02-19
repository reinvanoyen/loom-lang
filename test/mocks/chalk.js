const identity = (s) => (typeof s === 'string' ? s : String(s));
module.exports = new Proxy(identity, {
    get: () => identity,
});
