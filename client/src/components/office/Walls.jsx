
export function drawOfficeWalls(ctx, width, height) {
  // Top-down outer office walls
  const wallThickness = 18;

  ctx.fillStyle = "#d8c6b4";

  // Top wall
  ctx.fillRect(0, 0, width, wallThickness);

  // Bottom wall
  ctx.fillRect(0, height - wallThickness, width, wallThickness);

  // Left wall
  ctx.fillRect(0, 0, wallThickness, height);

  // Right wall
  ctx.fillRect(width - wallThickness, 0, wallThickness, height);

  // Wall outlines
  ctx.strokeStyle = "#b49b83";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    wallThickness,
    wallThickness,
    width - wallThickness * 2,
    height - wallThickness * 2
  );

  // Top-down glass meeting-room partition
  const roomX = width * 0.08;
  const roomY = height * 0.15;
  const roomWidth = width * 0.32;
  const roomHeight = height * 0.3;

  // Glass floor area
  ctx.fillStyle = "rgba(190, 220, 220, 0.18)";
  ctx.fillRect(roomX, roomY, roomWidth, roomHeight);

  // Glass partition frame
  ctx.strokeStyle = "#9bb6b3";
  ctx.lineWidth = 5;
  ctx.strokeRect(roomX, roomY, roomWidth, roomHeight);

  // Glass panel divider
  ctx.beginPath();
  ctx.moveTo(roomX + roomWidth / 2, roomY);
  ctx.lineTo(roomX + roomWidth / 2, roomY + roomHeight);
  ctx.stroke();

  // Door opening along the bottom partition
  const doorX = roomX + roomWidth * 0.68;
  const doorWidth = roomWidth * 0.2;
  const doorY = roomY + roomHeight;

  // Clear a gap in the bottom frame
  ctx.fillStyle = "#eee8dc";
  ctx.fillRect(doorX, doorY - 4, doorWidth, 9);

  // Top-down door leaf
  ctx.strokeStyle = "#a78365";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(doorX, doorY);
  ctx.lineTo(doorX, doorY - doorWidth * 0.65);
  ctx.stroke();

  // Door swing arc
  ctx.strokeStyle = "rgba(167, 131, 101, 0.65)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(
    doorX,
    doorY,
    doorWidth * 0.65,
    -Math.PI / 2,
    0
  );
  ctx.stroke();

  // Top-down exterior window along the top wall
  const windowX = width * 0.62;
  const windowWidth = width * 0.25;

  ctx.fillStyle = "#b9dfe5";
  ctx.fillRect(windowX, 0, windowWidth, wallThickness);

  ctx.strokeStyle = "#8ba9a8";
  ctx.lineWidth = 3;
  ctx.strokeRect(windowX, 0, windowWidth, wallThickness);

  // Window frame dividers
  ctx.beginPath();
  ctx.moveTo(windowX + windowWidth / 3, 0);
  ctx.lineTo(windowX + windowWidth / 3, wallThickness);

  ctx.moveTo(windowX + (windowWidth * 2) / 3, 0);
  ctx.lineTo(windowX + (windowWidth * 2) / 3, wallThickness);
  ctx.stroke();
}

export default drawOfficeWalls;
