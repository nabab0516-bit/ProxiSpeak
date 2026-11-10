export function drawAvatar(
  ctx,
  x,
  y,
  isWalking = false,
  walkFrame = 0,
  direction = "down"
) {
  // Avatar shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.beginPath();
  ctx.ellipse(x, y + 12, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Walking legs
  ctx.strokeStyle = "#5e4b85";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  const legSwing = isWalking ? Math.sin(walkFrame) * 4 : 0;

  ctx.beginPath();
  ctx.moveTo(x - 4, y + 7);
  ctx.lineTo(x - 6 - legSwing, y + 15);

  ctx.moveTo(x + 4, y + 7);
  ctx.lineTo(x + 6 + legSwing, y + 15);

  ctx.stroke();"round";

  ctx.beginPath();
  ctx.moveTo(x - 4, y + 7);
  ctx.lineTo(x - 6, y + 15);
  ctx.moveTo(x + 4, y + 7);
  ctx.lineTo(x + 6, y + 15);
  ctx.stroke();
  // Avatar body
  ctx.fillStyle = "#8b78b8";
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();

  // Avatar outline
  ctx.strokeStyle = "#5e4b85";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Avatar face
  ctx.fillStyle = "#f5d6bd";
  ctx.beginPath();
  ctx.arc(x, y - 3, 7, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#40352f";
  ctx.beginPath();

  let eyeOffsetX = 0;
  let eyeOffsetY = 0;

  if (direction === "left") eyeOffsetX = -1.5;
  if (direction === "right") eyeOffsetX = 1.5;
  if (direction === "up") eyeOffsetY = -1.5;
  if (direction === "down") eyeOffsetY = 1;

  ctx.arc(x - 2.5 + eyeOffsetX, y - 4 + eyeOffsetY, 1, 0, Math.PI * 2);
  ctx.arc(x + 2.5 + eyeOffsetX, y - 4 + eyeOffsetY, 1, 0, Math.PI * 2);
  ctx.fill();}

export default drawAvatar;
