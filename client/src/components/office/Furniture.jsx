export function drawOfficeFurniture(ctx, width, height, deskX = width * 0.58, deskY = height * 0.43)  {
  // Main workstation desk
  
  const deskWidth = width * 0.22;
  const deskHeight = height * 0.12;

  // Soft desk shadow
  ctx.fillStyle = "rgba(70, 50, 35, 0.12)";
  ctx.fillRect(
    deskX + 5,
    deskY + 5,
    deskWidth,
    deskHeight
  );

  // Wooden desktop
  ctx.fillStyle = "#b58c6a";
  ctx.fillRect(deskX, deskY, deskWidth, deskHeight);

  // Desktop outline
  ctx.strokeStyle = "#8f6b4e";
  ctx.lineWidth = 3;
  ctx.strokeRect(deskX, deskY, deskWidth, deskHeight);

  // Desk surface detail
  ctx.strokeStyle = "#d4b394";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(deskX + 8, deskY + 10);
  ctx.lineTo(deskX + deskWidth - 8, deskY + 10);
  ctx.stroke();

  // Monitor viewed from above
  const monitorWidth = deskWidth * 0.28;
  const monitorHeight = deskHeight * 0.35;
  const monitorX = deskX + (deskWidth - monitorWidth) / 2;
  const monitorY = deskY + 15;

  ctx.fillStyle = "#39464a";
  ctx.fillRect(
    monitorX,
    monitorY,
    monitorWidth,
    monitorHeight
  );

  ctx.fillStyle = "#b9dfe5";
  ctx.fillRect(
    monitorX + 4,
    monitorY + 4,
    monitorWidth - 8,
    monitorHeight - 8
  );

  // Keyboard
  ctx.fillStyle = "#eee8dc";
  ctx.fillRect(
    deskX + deskWidth * 0.32,
    deskY + deskHeight * 0.68,
    deskWidth * 0.36,
    deskHeight * 0.16
  );
  // Small notebook beside the keyboard
  ctx.fillStyle = "#d8c6b4";
  ctx.fillRect(
    deskX + deskWidth * 0.76,
    deskY + deskHeight * 0.62,
    deskWidth * 0.16,
    deskHeight * 0.25
  );

  ctx.strokeStyle = "#a78365";
  ctx.lineWidth = 1;
  ctx.strokeRect(
    deskX + deskWidth * 0.76,
    deskY + deskHeight * 0.62,
    deskWidth * 0.16,
    deskHeight * 0.25
  );
  // Chair below the desk
  const chairX = deskX + deskWidth / 2;
  const chairY = deskY + deskHeight + 18;

  ctx.fillStyle = "#647f75";
  ctx.beginPath();
  ctx.arc(chairX, chairY, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#40594f";
  ctx.lineWidth = 2;
  ctx.stroke();
    // Small desk-side plant
  const plantX = deskX - 18;
  const plantY = deskY + deskHeight / 2;

  // Plant pot
  ctx.fillStyle = "#c58f75";
  ctx.fillRect(plantX - 7, plantY - 6, 14, 14);

  // Leaves
  ctx.fillStyle = "#66866a";

  ctx.beginPath();
  ctx.ellipse(plantX - 5, plantY - 9, 5, 9, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(plantX + 5, plantY - 9, 5, 9, 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(plantX, plantY - 14, 5, 9, 0, 0, Math.PI * 2);
  ctx.fill();
    // Desk lamp
  const lampX = deskX + deskWidth * 0.12;
  const lampY = deskY + deskHeight * 0.3;

  // Lamp base
  ctx.fillStyle = "#d9b66f";
  ctx.beginPath();
  ctx.arc(lampX, lampY, 6, 0, Math.PI * 2);
  ctx.fill();

  // Lamp shade
  ctx.fillStyle = "#f3dfaa";
  ctx.beginPath();
  ctx.arc(lampX, lampY, 3, 0, Math.PI * 2);
  ctx.fill();
}
// Shared meeting table
export function drawMeetingTable(ctx, width, height) {
  const tableWidth = width * 0.2;
  const tableHeight = height * 0.1;
  const tableX = width * 0.45;
  const tableY = height * 0.2;

  // Table shadow
  ctx.fillStyle = "rgba(70, 50, 35, 0.12)";
  ctx.fillRect(
    tableX + 4,
    tableY + 4,
    tableWidth,
    tableHeight
  );

  // Wooden tabletop
  ctx.fillStyle = "#c49a76";
  ctx.fillRect(tableX, tableY, tableWidth, tableHeight);

  // Table border
  ctx.strokeStyle = "#8f6b4e";
  ctx.lineWidth = 3;
  ctx.strokeRect(tableX, tableY, tableWidth, tableHeight);

  // Center decoration
  ctx.fillStyle = "#66866a";
  ctx.beginPath();
  ctx.arc(
    tableX + tableWidth / 2,
    tableY + tableHeight / 2,
    8,
    0,
    Math.PI * 2
  );
  ctx.fill();
    // Meeting chairs — top and bottom
  const chairRadius = 10;
  const chairCount = 3;

  ctx.fillStyle = "#647f75";
  ctx.strokeStyle = "#40594f";
  ctx.lineWidth = 2;

  for (let i = 0; i < chairCount; i++) {
    const chairX =
      tableX + (tableWidth / (chairCount + 1)) * (i + 1);

    // Chairs above the table
    ctx.beginPath();
    ctx.arc(chairX, tableY - 15, chairRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Chairs below the table
    ctx.beginPath();
    ctx.arc(
      chairX,
      tableY + tableHeight + 15,
      chairRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();
  }
    // Meeting table centerpiece — terracotta pot
  const potX = tableX + tableWidth / 2;
  const potY = tableY + tableHeight / 2;

  ctx.fillStyle = "#c58f75";
  ctx.beginPath();
  ctx.arc(potX, potY, 5, 0, Math.PI * 2);
  ctx.fill();

  // Green leaves
  ctx.fillStyle = "#66866a";

  ctx.beginPath();
  ctx.ellipse(potX - 5, potY - 5, 4, 7, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(potX + 5, potY - 5, 4, 7, 0.5, 0, Math.PI * 2);
  ctx.fill();
}
// Office lounge sofa — top-down view
export function drawOfficeSofa(ctx, width, height) {
  const sofaX = width * 0.12;
  const sofaY = height * 0.62;
  const sofaWidth = width * 0.22;
  const sofaHeight = height * 0.1;

  // Sofa shadow
  ctx.fillStyle = "rgba(70, 50, 35, 0.12)";
  ctx.fillRect(
    sofaX + 4,
    sofaY + 4,
    sofaWidth,
    sofaHeight
  );

  // Sofa body
  ctx.fillStyle = "#879b8a";
  ctx.fillRect(sofaX, sofaY, sofaWidth, sofaHeight);

  // Backrest
  ctx.fillStyle = "#536f60";
  ctx.fillRect(
    sofaX,
    sofaY,
    sofaWidth,
    sofaHeight * 0.22
  );

  // Seat cushions
  ctx.fillStyle = "#b6c7b7";

  const cushionWidth = sofaWidth * 0.28;

  for (let i = 0; i < 3; i++) {
    ctx.fillRect(
      sofaX + 8 + i * (cushionWidth + 8),
      sofaY + sofaHeight * 0.32,
      cushionWidth,
      sofaHeight * 0.55
    );
  }

  // Sofa outline
  ctx.strokeStyle = "#536f60";
  ctx.lineWidth = 3;
  ctx.strokeRect(sofaX, sofaY, sofaWidth, sofaHeight);
}
// Lounge coffee table — top-down view
export function drawCoffeeTable(ctx, width, height) {
  const tableX = width * 0.17;
  const tableY = height * 0.76;
  const tableWidth = width * 0.12;
  const tableHeight = height * 0.06;

  // Soft shadow
  ctx.fillStyle = "rgba(70, 50, 35, 0.12)";
  ctx.fillRect(
    tableX + 3,
    tableY + 3,
    tableWidth,
    tableHeight
  );

  // Wooden tabletop
  ctx.fillStyle = "#c49a76";
  ctx.fillRect(tableX, tableY, tableWidth, tableHeight);

  // Table outline
  ctx.strokeStyle = "#8f6b4e";
  ctx.lineWidth = 2;
  ctx.strokeRect(tableX, tableY, tableWidth, tableHeight);

  // Coffee cup
  ctx.fillStyle = "#f5efe5";
  ctx.beginPath();
  ctx.arc(
    tableX + tableWidth / 2,
    tableY + tableHeight / 2,
    5,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.strokeStyle = "#8f6b4e";
  ctx.stroke();
}
// Lounge rug — top-down view
export function drawLoungeRug(ctx, width, height) {
  const rugX = width * 0.1;
  const rugY = height * 0.59;
  const rugWidth = width * 0.27;
  const rugHeight = height * 0.25;

  // Soft lavender rug
  ctx.fillStyle = "#d8c8d9";
  ctx.fillRect(rugX, rugY, rugWidth, rugHeight);

  // Decorative border
  ctx.strokeStyle = "#b9a2bd";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    rugX + 8,
    rugY + 8,
    rugWidth - 16,
    rugHeight - 16
  );
}

export function drawBookshelf(ctx, width, height) {
  const shelfX = width * 0.78;
  const shelfY = height * 0.48;
  const shelfWidth = width * 0.12;
  const shelfHeight = height * 0.18;

  // Wooden bookshelf
  ctx.fillStyle = "#a78365";
  ctx.fillRect(shelfX, shelfY, shelfWidth, shelfHeight);

  // Shelf outline
  ctx.strokeStyle = "#79583f";
  ctx.lineWidth = 3;
  ctx.strokeRect(shelfX, shelfY, shelfWidth, shelfHeight);

  // Books viewed from above
  const bookColors = [
    "#9b6b73",
    "#d9b66f",
    "#66866a",
    "#8ba9c0",
    "#b9a2bd"
  ];

  const bookWidth = shelfWidth * 0.16;

  for (let i = 0; i < bookColors.length; i++) {
    ctx.fillStyle = bookColors[i];
    ctx.fillRect(
      shelfX + 5 + i * (bookWidth + 3),
      shelfY + 8,
      bookWidth,
      shelfHeight - 16
    );
  }
}

export default drawOfficeFurniture;
