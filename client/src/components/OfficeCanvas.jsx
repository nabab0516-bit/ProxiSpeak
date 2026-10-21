import { useEffect, useRef } from "react";
import { drawOfficeFloor } from "./office/OfiiceFloor.jsx";
import { drawOfficeWalls } from "./office/Walls.jsx";
import { drawOfficeFurniture, drawMeetingTable, drawOfficeSofa, drawCoffeeTable, drawLoungeRug,drawBookshelf } from "./office/Furniture.jsx";
function OfficeCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function drawOffice() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      drawOfficeFloor(ctx, canvas.width, canvas.height);
      drawOfficeWalls(ctx, canvas.width, canvas.height);
      drawBookshelf(ctx, canvas.width, canvas.height);
      drawOfficeFurniture(ctx, canvas.width, canvas.height);
      drawMeetingTable(ctx, canvas.width, canvas.height);

      drawLoungeRug(ctx, canvas.width, canvas.height);
      drawOfficeSofa(ctx, canvas.width, canvas.height);
      drawCoffeeTable(ctx, canvas.width, canvas.height);
      
      drawOfficeFurniture(
  ctx,
  canvas.width,
  canvas.height,
  canvas.width * 0.58,
  canvas.height * 0.68
);

    }

    drawOffice();

    window.addEventListener("resize", drawOffice);

    return () => {
      window.removeEventListener("resize", drawOffice);
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

export default OfficeCanvas;