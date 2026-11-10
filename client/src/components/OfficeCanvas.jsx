import { useEffect, useRef, useState } from "react";
import { drawOfficeFloor } from "./office/OfiiceFloor.jsx";
import { drawOfficeWalls } from "./office/Walls.jsx";
import {
  drawOfficeFurniture,
  drawMeetingTable,
  drawOfficeSofa,
  drawCoffeeTable,
  drawLoungeRug,
  drawBookshelf,
} from "./office/Furniture.jsx";
import { drawAvatar } from "./office/Avatar.jsx";
function OfficeCanvas() {
  const canvasRef = useRef(null);
  const keysPressed = useRef({});
  const walkFrame = useRef(0);
  const direction = useRef("down");
  const [avatarPosition, setAvatarPosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
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
        canvas.height * 0.68,
      );
drawAvatar(
  ctx,
  avatarPosition.x,
  avatarPosition.y,
  Object.values(keysPressed.current).some(Boolean),
  walkFrame.current,
  direction.current
);
    }

    drawOffice();

    window.addEventListener("resize", drawOffice);

    return () => {
      window.removeEventListener("resize", drawOffice);
    };
  }, [avatarPosition]);

  useEffect(() => {
    const keys = keysPressed.current;

    function handleKeyDown(event) {
      const key = event.key.toLowerCase();

      if (
        [
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          "w",
          "a",
          "s",
          "d",
        ].includes(key)
      ) {
        event.preventDefault();
        keys[key] = true;
      }
    }

    function handleKeyUp(event) {
      keys[event.key.toLowerCase()] = false;
    }

    function handleBlur() {
      Object.keys(keys).forEach((key) => {
        keys[key] = false;
      });
    }

    let animationId;

    function moveAvatar() {
      const speed = 3;
      let dx = 0;
      let dy = 0;

      if (keys.arrowup || keys.w) dy -= speed;
      if (keys.arrowdown || keys.s) dy += speed;
      if (keys.arrowleft || keys.a) dx -= speed;
      if (keys.arrowright || keys.d) dx += speed;
      if (dy < 0) direction.current = "up";
      else if (dy > 0) direction.current = "down";
      else if (dx < 0) direction.current = "left";
      else if (dx > 0) direction.current = "right";
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }
      if (dx !== 0 || dy !== 0) {
        walkFrame.current += 0.2;
      } else {
        walkFrame.current = 0;
      }
      if (dx !== 0 || dy !== 0) {
        setAvatarPosition((position) => ({
          x: Math.max(35, Math.min(window.innerWidth - 35, position.x + dx)),
          y: Math.max(35, Math.min(window.innerHeight - 35, position.y + dy)),
        }));
      }

      animationId = requestAnimationFrame(moveAvatar);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    animationId = requestAnimationFrame(moveAvatar);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      cancelAnimationFrame(animationId);
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
