const { distance2D } = require('../src/utils/distance');
test('calculates 2D pixel distance', () => {
  expect(distance2D({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
});
