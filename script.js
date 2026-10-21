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

const nebulaStage = document.querySelector("#nebula-stage");
const nebulaScene = document.querySelector("#nebula-scene");
const nebulaLabels = document.querySelector("#nebula-labels");
const nebulaStatus = document.querySelector("#nebula-status");
const keywordNodes = [
  { label: "自我介绍", url: "topics/introduction.html", position: [-2.25, 0.92, 0.45] },
  { label: "工作经历", url: "topics/experience.html", position: [-0.65, 1.64, -0.9] },
  { label: "教育背景", url: "topics/education.html", position: [1.1, 1.03, 1.25] },
  { label: "项目作品", url: "topics/projects.html", position: [2.28, 0.38, -0.25] },
  { label: "专业技能", url: "topics/skills.html", position: [0.82, -0.1, -1.48] },
  { label: "工具能力", url: "topics/tools.html", position: [-1.08, -0.42, 1.02] },
  { label: "协作沟通", url: "topics/collaboration.html", position: [-2.1, -1.12, -0.78] },
  { label: "所在城市", url: "topics/city.html", position: [-0.18, -1.5, 1.48] },
  { label: "联系方式", url: "topics/contact.html", position: [1.42, -1.16, 0.38] },
  { label: "兴趣方向", url: "topics/interests.html", position: [0.18, 1.78, 0.5] }
];

function startNebula() {
  if (!window.THREE || !nebulaScene) {
    nebulaStatus.textContent = "3D 星云暂时无法加载，请刷新页面重试。";
    return;
  }

  const THREE = window.THREE;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(nebulaScene.clientWidth, nebulaScene.clientHeight);
  renderer.setClearColor(0xe6f3f8, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  nebulaScene.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe6f3f8, 5.6, 11.5);
  const camera = new THREE.PerspectiveCamera(42, nebulaScene.clientWidth / nebulaScene.clientHeight, 0.1, 80);
  camera.position.set(0, 0, 8.8);
  let zoom = 1;
  let fitDistance = 8.8;
  function updateFog() {
    scene.fog.near = camera.position.z - 1.2;
    scene.fog.far = camera.position.z + 5;
  }

  const network = new THREE.Group();
  scene.add(network);
  const points = keywordNodes.map((item, index) => {
    const position = new THREE.Vector3(...item.position);
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(index % 3 === 0 ? 0.052 : 0.038, 12, 10),
      new THREE.MeshBasicMaterial({ color: index % 4 === 0 ? 0xef8c91 : 0x4e9fb2 })
    );
    marker.position.copy(position);
    network.add(marker);
    item.anchor = document.createElement("a");
    item.anchor.className = "nebula-label";
    item.anchor.href = item.url;
    item.anchor.textContent = item.label;
    item.anchor.setAttribute("aria-label", "打开：" + item.label);
    nebulaLabels.append(item.anchor);
    return { position, marker, anchor: item.anchor };
  });

  const edgePairs = [
    [0, 1], [0, 2], [0, 5], [0, 6], [0, 9],
    [1, 2], [1, 3], [1, 4], [1, 9],
    [2, 3], [2, 5], [2, 7], [2, 9],
    [3, 4], [3, 8], [3, 9],
    [4, 5], [4, 6], [4, 8], [4, 9],
    [5, 6], [5, 7], [5, 9],
    [6, 7], [6, 8],
    [7, 8], [7, 9],
    [8, 9]
  ];
  const linePositions = new Float32Array(edgePairs.length * 6);
  const lineColors = new Float32Array(edgePairs.length * 6);
  edgePairs.forEach(([from, to], index) => {
    linePositions.set([...keywordNodes[from].position, ...keywordNodes[to].position], index * 6);
  });
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
  const lines = new THREE.LineSegments(
    lineGeometry,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.65, depthWrite: false })
  );
  network.add(lines);

  let randomSeed = 219201;
  const random = () => {
    randomSeed = (randomSeed * 16807) % 2147483647;
    return (randomSeed - 1) / 2147483646;
  };
  const particlePositions = new Float32Array(260 * 3);
  for (let i = 0; i < 260; i += 1) {
    const angle = random() * Math.PI * 2;
    const vertical = random() * 2 - 1;
    const radius = 2.2 + random() * 1.7;
    const horizontal = Math.sqrt(1 - vertical * vertical);
    particlePositions.set([
      Math.cos(angle) * horizontal * radius,
      vertical * radius * 0.72,
      Math.sin(angle) * horizontal * radius
    ], i * 3);
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({ color: 0x78adbd, size: 0.025, transparent: true, opacity: 0.42, depthWrite: false, sizeAttenuation: true })
  );
  network.add(particles);

  const pointer = { down: false, moved: false, x: 0, y: 0 };
  let suppressClick = false;
  let lastFrame = 0;
  const worldPosition = new THREE.Vector3();
  const cameraPosition = new THREE.Vector3();
  const tempColor = new THREE.Color();

  function projectLabels() {
    network.updateMatrixWorld(true);
    camera.getWorldPosition(cameraPosition);
    points.forEach((point, index) => {
      point.marker.getWorldPosition(worldPosition);
      const distance = cameraPosition.distanceTo(worldPosition);
      const projected = worldPosition.clone().project(camera);
      const x = (projected.x * 0.5 + 0.5) * nebulaScene.clientWidth;
      const y = (-projected.y * 0.5 + 0.5) * nebulaScene.clientHeight;
      const depth = THREE.MathUtils.clamp((distance - camera.position.z + 2.5) / 5, 0, 1);
      const scale = THREE.MathUtils.clamp(fitDistance / distance, 0.62, 1.65);
      const opacity = 1 - depth * 0.65;
      point.anchor.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
      point.anchor.style.left = x + "px";
      point.anchor.style.top = y + "px";
      point.anchor.style.opacity = String(opacity);
      point.anchor.style.zIndex = String(10 - Math.round(depth * 8));
      point.anchor.classList.toggle("is-far", depth > 0.54);
      point.anchor.style.visibility = projected.z > 1 || projected.z < -1 ? "hidden" : "visible";
    });

    const colorAttribute = lineGeometry.attributes.color;
    edgePairs.forEach(([from, to], index) => {
      points[from].marker.getWorldPosition(worldPosition);
      const fromDepth = THREE.MathUtils.clamp((cameraPosition.distanceTo(worldPosition) - camera.position.z + 2.5) / 5, 0, 1);
      points[to].marker.getWorldPosition(worldPosition);
      const toDepth = THREE.MathUtils.clamp((cameraPosition.distanceTo(worldPosition) - camera.position.z + 2.5) / 5, 0, 1);
      tempColor.set(0x6395ac).lerp(new THREE.Color(0xe6f3f8), fromDepth * 0.8);
      colorAttribute.setXYZ(index * 2, tempColor.r, tempColor.g, tempColor.b);
      tempColor.set(0x6395ac).lerp(new THREE.Color(0xe6f3f8), toDepth * 0.8);
      colorAttribute.setXYZ(index * 2 + 1, tempColor.r, tempColor.g, tempColor.b);
    });
    colorAttribute.needsUpdate = true;
  }

  function animate(timestamp) {
    const delta = lastFrame ? Math.min(timestamp - lastFrame, 40) : 16;
    lastFrame = timestamp;
    if (!pointer.down && !nebulaLabels.matches(":hover, :focus-within") && !reducedMotion.matches) network.rotation.y += delta * 0.000045;
    projectLabels();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  nebulaScene.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    pointer.down = true;
    pointer.moved = false;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    nebulaScene.classList.add("is-dragging");
    event.target.setPointerCapture(event.pointerId);
  });
  nebulaScene.addEventListener("pointermove", (event) => {
    if (!pointer.down) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) pointer.moved = true;
    network.rotation.y += dx * 0.006;
    network.rotation.x = THREE.MathUtils.clamp(network.rotation.x + dy * 0.005, -1.05, 1.05);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
  const finishDrag = () => {
    pointer.down = false;
    nebulaScene.classList.remove("is-dragging");
    if (pointer.moved) {
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 0);
    }
  };
  nebulaScene.addEventListener("pointerup", finishDrag);
  nebulaScene.addEventListener("pointercancel", finishDrag);
  nebulaScene.addEventListener("click", (event) => {
    if (suppressClick) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
  nebulaScene.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoom = THREE.MathUtils.clamp(zoom * Math.exp(Math.max(-200, Math.min(200, event.deltaY)) * 0.001), 0.72, 1.5);
    camera.position.z = fitDistance * zoom;
    updateFog();
  }, { passive: false });

  const resizeObserver = new ResizeObserver(() => {
    const width = nebulaScene.clientWidth;
    const height = nebulaScene.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    fitDistance = Math.max(8.8, 3.4 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
    camera.position.z = fitDistance * zoom;
    updateFog();
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    projectLabels();
  });
  resizeObserver.observe(nebulaScene);
  nebulaStatus.textContent = "10 个关键词已加载。";
  requestAnimationFrame(animate);
}

try {
  startNebula();
} catch (error) {
  nebulaScene.classList.add("nebula-fallback");
  nebulaLabels.replaceChildren();
  keywordNodes.forEach((node) => {
    const anchor = document.createElement("a");
    anchor.className = "nebula-label";
    anchor.href = node.url;
    anchor.textContent = node.label;
    nebulaLabels.append(anchor);
  });
  nebulaStatus.textContent = "当前设备无法显示 3D，仍可点击关键词进入对应页面。";
  console.error("Keyword constellation could not initialize:", error);
}
