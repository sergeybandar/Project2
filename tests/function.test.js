const getPeople = require('../src/getPeople.js');
test('getPeople', () => {
    expect(() => getPeople(-1)).toThrow();
});
test('getPeople', () => {
    expect(() => getPeople(0)).toThrow();
});
test('getPeople', () => {
    expect(() => getPeople('a')).toThrow();
});
test('getPeople', () => {
    expect(getPeople(275)).toBe('275');
    expect(getPeople(35453)).toBe('35К');
    expect(getPeople(35453000)).toBe('35М');
});