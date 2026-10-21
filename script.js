const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
document.querySelector("#year").textContent = new Date().getFullYear();

const easterEgg = document.querySelector("#patrick-mode");
easterEgg.addEventListener("click", () => {
  document.body.classList.toggle("patrick-party");
  easterEgg.textContent = document.body.classList.contains("patrick-party")
    ? "今天也要好好生活 ★"
    : "认真生活，保持好奇 ✦";
});

const nebulaCanvas = document.querySelector(".nebula-canvas");
const nebulaContext = nebulaCanvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let nebulaWidth = 0;
let nebulaHeight = 0;
let nebulaAngle = 0;
let nebulaFrame = 0;
let lastNebulaFrame = 0;
let nebulaPoints = [];

let seed = 219201;
function nebulaRandom() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

function createNebula() {
  seed = 219201;
  nebulaPoints = Array.from({ length: 190 }, (_, index) => {
    const z = nebulaRandom() * 2 - 1;
    const angle = nebulaRandom() * Math.PI * 2;
    const ring = Math.sqrt(1 - z * z) * (0.52 + nebulaRandom() * 0.48);
    const arm = Math.sin(angle * 3 + z * 2) * 0.09;
    return {
      x: Math.cos(angle) * (ring + arm),
      y: Math.sin(angle) * (ring + arm) * 0.76,
      z: z * 0.63,
      color: index % 9 === 0 ? "255,139,154" : index % 7 === 0 ? "191,164,255" : "132,224,231",
      links: []
    };
  });

  nebulaPoints.forEach((point, index) => {
    const neighbors = nebulaPoints
      .map((candidate, candidateIndex) => {
        const dx = point.x - candidate.x;
        const dy = point.y - candidate.y;
        const dz = point.z - candidate.z;
        return { index: candidateIndex, distance: dx * dx + dy * dy + dz * dz };
      })
      .filter((candidate) => candidate.index !== index)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);

    point.links = neighbors
      .filter((neighbor) => neighbor.distance < 0.16)
      .map((neighbor) => neighbor.index);
  });
}

function resizeNebula() {
  const bounds = nebulaCanvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  nebulaWidth = bounds.width;
  nebulaHeight = bounds.height;
  nebulaCanvas.width = Math.round(nebulaWidth * pixelRatio);
  nebulaCanvas.height = Math.round(nebulaHeight * pixelRatio);
  nebulaContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  drawNebula();
}

function drawNebula(timestamp = 0) {
  if (!nebulaWidth || !nebulaHeight) return;
  nebulaContext.clearRect(0, 0, nebulaWidth, nebulaHeight);

  const cosine = Math.cos(nebulaAngle);
  const sine = Math.sin(nebulaAngle);
  const scale = Math.min(nebulaWidth * 0.44, nebulaHeight * 0.78, 390);
  const centerX = nebulaWidth * (nebulaWidth < 700 ? 0.65 : 0.68);
  const centerY = nebulaHeight * 0.51;
  const projected = nebulaPoints.map((point, index) => {
    const x = point.x * cosine - point.z * sine;
    const z = point.x * sine + point.z * cosine;
    const y = point.y * Math.cos(0.28) - z * Math.sin(0.28);
    const depth = point.y * Math.sin(0.28) + z * Math.cos(0.28);
    const perspective = 2.25 / (2.75 - depth);
    return {
      x: centerX + x * scale * perspective,
      y: centerY + y * scale * perspective,
      z: depth,
      radius: (1.1 + (depth + 0.7) * 1.5) * perspective,
      color: point.color,
      links: point.links,
      index
    };
  });

  const edges = [];
  projected.forEach((point) => {
    point.links.forEach((linkIndex) => {
      if (linkIndex > point.index) {
        edges.push({ from: point, to: projected[linkIndex], depth: (point.z + projected[linkIndex].z) / 2 });
      }
    });
  });

  edges.sort((a, b) => a.depth - b.depth);
  edges.forEach(({ from, to, depth }) => {
    const opacity = 0.035 + Math.max(0, depth + 0.65) * 0.13;
    nebulaContext.beginPath();
    nebulaContext.moveTo(from.x, from.y);
    nebulaContext.lineTo(to.x, to.y);
    nebulaContext.strokeStyle = "rgba(143,218,235," + opacity + ")";
    nebulaContext.lineWidth = 0.45 + Math.max(0, depth) * 0.35;
    nebulaContext.stroke();
  });

  projected.sort((a, b) => a.z - b.z);
  projected.forEach((point) => {
    const opacity = 0.16 + Math.max(0, point.z + 0.55) * 0.62;
    nebulaContext.beginPath();
    nebulaContext.arc(point.x, point.y, Math.max(0.55, point.radius), 0, Math.PI * 2);
    nebulaContext.fillStyle = "rgba(" + point.color + "," + opacity + ")";
    nebulaContext.fill();
  });

  if (!reducedMotion.matches) {
    if (lastNebulaFrame) nebulaAngle += Math.min(timestamp - lastNebulaFrame, 40) * 0.0001;
    lastNebulaFrame = timestamp;
    nebulaFrame = requestAnimationFrame(drawNebula);
  }
}

function restartNebula() {
  cancelAnimationFrame(nebulaFrame);
  lastNebulaFrame = 0;
  drawNebula();
}

createNebula();
resizeNebula();
window.addEventListener("resize", resizeNebula);
reducedMotion.addEventListener("change", restartNebula);
