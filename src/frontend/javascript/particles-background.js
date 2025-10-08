function initParticlesBackground() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = "-1";
  canvas.style.opacity = "0.5";
  canvas.style.pointerEvents = "none";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  const config = {
    particleDensity: 0.0002,
    baseSpeed: 0.3,
    maxSize: 3,
    minSize: 1,
    lineMaxDistance: 120,
    color: "rgba(100, 149, 237, 0.8)",
    lineColor: "rgba(100, 149, 237, 0.3)",
  };

  const screenArea = width * height;
  const particleCount = Math.min(
    Math.max(Math.floor(screenArea * config.particleDensity), 30),
    150
  );

  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const speedX = (Math.random() * 2 - 1) * config.baseSpeed;
    const speedY = (Math.random() * 2 - 1) * config.baseSpeed;
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * (config.maxSize - config.minSize) + config.minSize,
      speedX: speedX,
      speedY: speedY,
      originalSpeedX: speedX,
      originalSpeedY: speedY,
    });
  }

  let mouseX = null;
  let mouseY = null;
  const mouseRadius = 150;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener("mouseout", () => {
    mouseX = null;
    mouseY = null;
  });

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      const dxMouse = mouseX - p.x;
      const dyMouse = mouseY - p.y;
      const mouseDistance = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

      if (mouseX !== null && mouseY !== null && mouseDistance < mouseRadius) {
        const force = (mouseRadius - mouseDistance) / mouseRadius;
        const angle = Math.atan2(dyMouse, dxMouse);

        p.speedX = p.originalSpeedX - Math.cos(angle) * force * 2;
        p.speedY = p.originalSpeedY - Math.sin(angle) * force * 2;
      } else {
        p.speedX += (p.originalSpeedX - p.speedX) * 0.05;
        p.speedY += (p.originalSpeedY - p.speedY) * 0.05;
      }

      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < p.size) {
        p.speedX *= -1;
        p.originalSpeedX *= -1;
        p.x = p.size + (p.size - p.x);
      } else if (p.x > width - p.size) {
        p.speedX *= -1;
        p.originalSpeedX *= -1;
        p.x = width - p.size - (p.x - (width - p.size));
      }

      if (p.y < p.size) {
        p.speedY *= -1;
        p.originalSpeedY *= -1;
        p.y = p.size + (p.size - p.y);
      } else if (p.y > height - p.size) {
        p.speedY *= -1;
        p.originalSpeedY *= -1;
        p.y = height - p.size - (p.y - (height - p.size));
      }

      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.lineMaxDistance) {
          const opacity = 1 - distance / config.lineMaxDistance;
          ctx.strokeStyle = `rgba(100, 149, 237, ${opacity * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  function handleResize() {
    const oldWidth = width;
    const oldHeight = height;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const scaleX = width / oldWidth;
    const scaleY = height / oldHeight;

    for (let i = 0; i < particles.length; i++) {
      particles[i].x *= scaleX;
      particles[i].y *= scaleY;
    }
  }

  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  });

  animate();
}

function initWhenReady() {
  if (document.body) {
    initParticlesBackground();
  } else {
    document.addEventListener("DOMContentLoaded", initParticlesBackground);
  }
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  setTimeout(initWhenReady, 0);
} else {
  document.addEventListener("DOMContentLoaded", initWhenReady);
}
