export function drawOfficeFloor(ctx, width, height) {
  // Base floor colour
  ctx.fillStyle = "#eee8dc";
  ctx.fillRect(0, 0, width, height);
    // Wooden floor planks
  ctx.strokeStyle = "#d6c6ad";
  ctx.lineWidth = 1;

  const plankHeight = 45;

  for (let y = 0; y < height; y += plankHeight) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
    // Vertical joints between wooden planks
  const plankWidth = 120;

  for (let y = 0; y < height; y += plankHeight) {
    const offset = (y / plankHeight) % 2 === 0 ? 0 : plankWidth / 2;

    for (let x = offset; x < width; x += plankWidth) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + plankHeight);
      ctx.stroke();
    }
  }
    // Subtle wood grain details
  ctx.strokeStyle = "#e0d3bd";
  ctx.lineWidth = 1;

  for (let y = 15; y < height; y += 45) {
    for (let x = 20; x < width; x += 160) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 35, y);
      ctx.stroke();
    }
  }
    // Subtle office floor border
  ctx.strokeStyle = "#c8b9a3";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, width - 6, height - 6);
    // Central office rug
  const rugWidth = width * 0.3;
  const rugHeight = height * 0.22;
  const rugX = (width - rugWidth) / 2;
  const rugY = (height - rugHeight) / 2;

  ctx.fillStyle = "#d8c8d9";
  ctx.fillRect(rugX, rugY, rugWidth, rugHeight);

  ctx.strokeStyle = "#b9a2bd";
  ctx.lineWidth = 3;
  ctx.strokeRect(rugX + 8, rugY + 8, rugWidth - 16, rugHeight - 16);
    // Decorative rug pattern
  ctx.strokeStyle = "#a990b0";
  ctx.lineWidth = 2;

  const centerX = width / 2;
  const centerY = height / 2;

  ctx.beginPath();
  ctx.moveTo(centerX - rugWidth * 0.3, centerY);
  ctx.lineTo(centerX + rugWidth * 0.3, centerY);
  ctx.moveTo(centerX, centerY - rugHeight * 0.3);
  ctx.lineTo(centerX, centerY + rugHeight * 0.3);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
  ctx.stroke();
    // Decorative plant pot
  const plantX = width * 0.12;
  const plantY = height * 0.18;

  // Pot
  ctx.fillStyle = "#c58f75";
  ctx.fillRect(plantX - 12, plantY + 8, 24, 22);

  // Leaves
  ctx.fillStyle = "#66866a";

  ctx.beginPath();
  ctx.ellipse(plantX - 8, plantY, 7, 14, -0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(plantX + 8, plantY, 7, 14, 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(plantX, plantY - 8, 7, 14, 0, 0, Math.PI * 2);
  ctx.fill();
    // Second decorative plant
  const plant2X = width * 0.88;
  const plant2Y = height * 0.78;

  // Pot
  ctx.fillStyle = "#c58f75";
  ctx.fillRect(plant2X - 12, plant2Y + 8, 24, 22);

  // Leaves
  ctx.fillStyle = "#66866a";

  ctx.beginPath();
  ctx.ellipse(plant2X - 8, plant2Y, 7, 14, -0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(plant2X + 8, plant2Y, 7, 14, 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(plant2X, plant2Y - 8, 7, 14, 0, 0, Math.PI * 2);
  ctx.fill();
}
export default drawOfficeFloor;