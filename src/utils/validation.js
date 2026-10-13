function validPosition(p) {
  return !!p && typeof p.x === 'number' && Number.isFinite(p.x) && p.x >= 0
    && typeof p.y === 'number' && Number.isFinite(p.y) && p.y >= 0;
}
module.exports = { validPosition };
