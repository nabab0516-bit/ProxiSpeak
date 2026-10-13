import { useEffect, useRef } from "react";
import { drawOfficeFloor } from "./office/OfiiceFloor.jsx";

function OfficeCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function drawOffice() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      drawOfficeFloor(ctx, canvas.width, canvas.height);
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