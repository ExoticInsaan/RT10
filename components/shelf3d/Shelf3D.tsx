"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";

/** One tool as the 3D shelf needs it. Plain data, so a server page can pass it straight in. */
export type ShelfItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  imageBg?: string;
  imageFit?: "cover" | "contain";
};

type Props = {
  items: ShelfItem[];
  /** Called when a tool is tapped or clicked in the scene. */
  onOpen: (id: string) => void;
  /** Shown if this device can't draw WebGL. */
  fallback?: React.ReactNode;
};

/* ---------- Layout of the aisle (world units, roughly metres) ---------- */

const BAY = 2.1; // distance between two neighbouring bays along the aisle
const WALL_X = 2.0; // the back of each shelf wall sits at x = ±WALL_X
const BOARD_DEPTH = 0.78; // how far each board sticks out from the wall
const CARD = { w: 1.15, h: 1.5, d: 0.14 };
const BOARD_Y = [0.12, 1.9]; // the two shelves cards stand on
const ROOF_Y = 4.05;
const EYE_Y = 1.55;
const START_Z = 4.0; // camera sits this far in front of the bay it is "at"
const TILT = 0.62; // cards are turned this much toward whoever walks in

const COLOR = {
  sky: 0xfbf1e2, // fog and background: warm cream, like the site
  floor: 0xeadcc4,
  wood: 0xd2a06c, // shelf boards: light oak
  woodDark: 0xf0e2cb, // the wall behind the shelves: soft cream
  post: 0xcf9d6c,
  cardSide: 0xd9d2c4,
};

const SIDE_LABELS = ["The Shelf", "Fun Zone"];

/* ---------- Drawing a card's front onto a canvas (used as its texture) ---------- */

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function paintCard(canvas: HTMLCanvasElement, item: ShelfItem, img?: HTMLImageElement) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const artH = Math.round(H * 0.68);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, artH);
  ctx.clip();
  ctx.fillStyle = item.imageBg ?? "#e8edff";
  ctx.fillRect(0, 0, W, artH);
  if (img) {
    const cover = (item.imageFit ?? "cover") === "cover";
    const scale = cover ? Math.max(W / img.width, artH / img.height) : Math.min(W / img.width, artH / img.height) * 0.88;
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (W - dw) / 2, (artH - dh) / 2, dw, dh);
  }
  ctx.restore();

  ctx.fillStyle = "#0f2a4d";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(W * 0.085)}px Inter, system-ui, -apple-system, "Segoe UI", sans-serif`;
  const lines = wrapLines(ctx, item.name, W - 56);
  const lineH = Math.round(W * 0.1);
  const top = artH + (H - artH) / 2 - ((lines.length - 1) * lineH) / 2;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, top + i * lineH));

  ctx.strokeStyle = "rgba(15,42,77,0.12)";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, W - 4, H - 4);
}

function signTexture(label: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#3a2616";
  ctx.fillRect(0, 0, 1024, 256);
  ctx.strokeStyle = "#e9c48f";
  ctx.lineWidth = 8;
  ctx.strokeRect(14, 14, 996, 228);
  ctx.fillStyle = "#fbe9cc";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 118px Inter, system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.fillText(label.toUpperCase(), 512, 136);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/* ---------- The component ---------- */

type Api = { go: (step: number) => void };

export default function Shelf3D({ items, onOpen, fallback }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Api>({ go: () => {} });
  const onOpenRef = useRef(onOpen);
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState<ShelfItem | null>(null);
  const [bay, setBay] = useState(0);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  // Two walls: the first category on the left, everything else on the right.
  const firstCategory = items[0]?.category;
  const left = items.filter((i) => i.category === firstCategory);
  const right = items.filter((i) => i.category !== firstCategory);
  const sides = right.length ? [left, right] : [left.filter((_, i) => i % 2 === 0), left.filter((_, i) => i % 2 === 1)];
  const bays = Math.max(1, Math.ceil(Math.max(sides[0].length, sides[1].length) / 2));

  const key = items.map((i) => i.id).join("|");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      queueMicrotask(() => setFailed(true)); // no WebGL on this device: show the fallback instead
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(COLOR.sky);
    const canvas = renderer.domElement;
    canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:none;outline:none";
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLOR.sky);
    scene.fog = new THREE.Fog(COLOR.sky, 5, 17);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 40);

    scene.add(new THREE.HemisphereLight(0xfffaf0, 0xe3cfb0, 2.3));
    const headLight = new THREE.PointLight(0xffe9cc, 5, 8, 1.6);
    scene.add(headLight);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(thing: T) => {
      disposables.push(thing);
      return thing;
    };

    const mat = (color: number) => track(new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0 }));
    const woodMat = mat(COLOR.wood);
    const backMat = mat(COLOR.woodDark);
    const postMat = mat(COLOR.post);
    const floorMat = mat(COLOR.floor);
    const roofMat = mat(0xf7ecdc);

    const boxGeo = track(new THREE.BoxGeometry(1, 1, 1));
    const addBox = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(boxGeo, m);
      mesh.scale.set(w, h, d);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    };

    // Room: floor, roof and the two walls of shelving.
    const wallZ0 = START_Z + 3; // the shelving starts well behind the camera, so the room never looks cut off
    const endZ = -((bays - 1) * BAY) - 4.2; // the closed end of the aisle
    const wallLen = wallZ0 - endZ;
    const wallMid = (wallZ0 + endZ) / 2;
    addBox(WALL_X * 2 + 0.2, 0.1, wallLen, floorMat, 0, -0.05, wallMid);
    addBox(WALL_X * 2 + 0.2, 0.1, wallLen, roofMat, 0, ROOF_Y + 0.05, wallMid);
    addBox(WALL_X * 2, ROOF_Y + 0.2, 0.2, backMat, 0, ROOF_Y / 2, endZ);

    for (const s of [-1, 1]) {
      addBox(0.1, ROOF_Y, wallLen, backMat, s * (WALL_X + 0.05), ROOF_Y / 2, wallMid);
      for (const y of [...BOARD_Y, 3.62]) addBox(BOARD_DEPTH, 0.08, wallLen, woodMat, s * (WALL_X - BOARD_DEPTH / 2), y, wallMid);
      for (let i = -3; i <= bays; i++) {
        // Thin dividers against the back wall, behind the tools, so nothing ever covers a card.
        addBox(0.06, ROOF_Y - 0.1, 0.1, postMat, s * (WALL_X - 0.04), ROOF_Y / 2, -i * BAY + BAY / 2);
      }
    }

    // Signs over the start of each wall.
    const signGeo = track(new THREE.PlaneGeometry(2, 0.5));
    [-1, 1].forEach((s, index) => {
      const texture = track(signTexture(items.length ? (index === 0 ? firstCategory ?? SIDE_LABELS[0] : SIDE_LABELS[1]) : SIDE_LABELS[index]));
      const sign = new THREE.Mesh(signGeo, track(new THREE.MeshBasicMaterial({ map: texture, fog: false })));
      sign.position.set(s * (WALL_X - 0.02), 3.84, BAY * 0.5);
      sign.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(sign);
    });

    // The tools: two shelves per wall, filled from the front of the aisle backwards.
    type Card = { mesh: THREE.Mesh; item: ShelfItem; base: THREE.Vector3; hover: number; front: THREE.MeshStandardMaterial; side: number };
    const cards: Card[] = [];
    const cardGeo = track(new THREE.BoxGeometry(CARD.w, CARD.h, CARD.d));
    const sideMat = mat(COLOR.cardSide);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    sides.forEach((list, sideIndex) => {
      const s = sideIndex === 0 ? -1 : 1;
      const perRow = Math.ceil(list.length / 2);
      list.forEach((item, i) => {
        const row = i < perRow ? 1 : 0; // 1 = upper shelf, 0 = lower shelf
        const col = row === 1 ? i : i - perRow;
        const canvasEl = document.createElement("canvas");
        canvasEl.width = 448;
        canvasEl.height = 584;
        paintCard(canvasEl, item);
        const texture = track(new THREE.CanvasTexture(canvasEl));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(4, maxAniso);
        const front = track(
          new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6, emissive: new THREE.Color(0xffffff), emissiveMap: texture, emissiveIntensity: 0.16 }),
        );
        const mesh = new THREE.Mesh(cardGeo, [sideMat, sideMat, sideMat, sideMat, front, sideMat]);
        const wobble = ((i * 37 + sideIndex * 11) % 7) / 7 - 0.5; // small, fixed: same every visit
        mesh.rotation.y = -s * (Math.PI / 2 - TILT) + wobble * 0.1;
        const base = new THREE.Vector3(s * (WALL_X - 0.5), BOARD_Y[row] + 0.04 + CARD.h / 2, -col * BAY + wobble * 0.12);
        mesh.position.copy(base);
        mesh.userData.index = cards.length;
        scene.add(mesh);
        cards.push({ mesh, item, base, hover: 0, front, side: s });

        if (item.image) {
          const img = new Image();
          img.onload = () => {
            paintCard(canvasEl, item, img);
            texture.needsUpdate = true;
            kick();
          };
          img.src = item.image;
        }
      });
    });

    /* ----- Movement along the aisle ----- */
    const maxP = (bays - 1) * BAY + 1.2;
    const clampP = (v: number) => Math.min(maxP, Math.max(0, v));
    let p = 0;
    let target = 0;
    let vel = 0;
    let snapAt = 0;
    let dragging = false;
    let moved = false;
    let downX = 0;
    let downY = 0;
    let downT = 0;
    let lastX = 0;
    let lastY = 0;
    let yaw = 0;
    let pitch = 0;
    const pointer = new THREE.Vector2(0, 0);
    let pointerInside = false;
    let hoverIndex = -1;
    let shownBay = 0;
    let shownHover = -1;
    let sawInput = false;
    let yawHold = 0; // the camera stays put while a card is under the pointer, so the card doesn't slide away
    let pitchHold = 0;

    // Motion is based on elapsed time, not frames, so it feels the same on a slow phone and a 120 Hz screen.
    let lastFrame = 0;
    let lastMoveT = 0;
    const raycaster = new THREE.Raycaster();
    const pick = () => {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(cards.map((c) => c.mesh), false)[0];
      return hit ? (hit.object.userData.index as number) : -1;
    };

    const touchedInput = () => {
      if (!sawInput) {
        sawInput = true;
        setHint(false);
      }
    };

    let raf = 0;
    function kick() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function frame(now: number) {
      raf = 0;
      const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 1 / 60;
      lastFrame = now;
      if (!dragging) {
        target = clampP(target + vel * dt);
        vel *= Math.exp(-dt * 5);
        if (Math.abs(vel) < 0.04) vel = 0;
        if (vel === 0 && snapAt && performance.now() > snapAt) {
          target = clampP(Math.round(target / BAY) * BAY);
          snapAt = 0;
        }
      }
      p = reduceMotion ? target : p + (target - p) * (1 - Math.exp(-dt * 6.5));
      if (Math.abs(target - p) < 0.0008) p = target;

      if (hoverIndex < 0) {
        yawHold = reduceMotion || !pointerInside ? 0 : -pointer.x * 0.22;
        pitchHold = reduceMotion || !pointerInside ? 0 : pointer.y * 0.07;
      }
      const yawTarget = yawHold;
      const pitchTarget = pitchHold;
      const look = 1 - Math.exp(-dt * 5);
      yaw += (yawTarget - yaw) * look;
      pitch += (pitchTarget - pitch) * look;

      camera.position.set(0, EYE_Y, START_Z - p);
      camera.rotation.set(pitch, yaw, 0, "YXZ");
      headLight.position.set(0, EYE_Y + 0.6, START_Z - p - 0.5);

      hoverIndex = pointerInside && !dragging ? pick() : -1;
      let animating = false;
      for (const c of cards) {
        const want = cards.indexOf(c) === hoverIndex ? 1 : 0;
        c.hover += (want - c.hover) * (1 - Math.exp(-dt * 13));
        if (Math.abs(want - c.hover) < 0.01) c.hover = want;
        else animating = true;
        const lift = c.hover;
        c.mesh.position.set(c.base.x - c.side * 0.22 * lift, c.base.y, c.base.z + 0.18 * lift);
        c.mesh.scale.setScalar(1 + 0.07 * lift);
        c.front.emissiveIntensity = 0.16 + 0.22 * lift;
      }
      canvas.style.cursor = hoverIndex >= 0 ? "pointer" : dragging ? "grabbing" : "grab";

      const nowBay = Math.min(bays - 1, Math.max(0, Math.round(p / BAY)));
      if (nowBay !== shownBay) {
        shownBay = nowBay;
        setBay(nowBay);
      }
      if (hoverIndex !== shownHover) {
        shownHover = hoverIndex;
        setHovered(hoverIndex >= 0 ? cards[hoverIndex].item : null);
      }

      renderer.render(scene, camera);

      const settling =
        dragging ||
        animating ||
        vel !== 0 ||
        snapAt !== 0 ||
        target !== p ||
        Math.abs(yawTarget - yaw) > 0.0005 ||
        Math.abs(pitchTarget - pitch) > 0.0005 ||
        (pointerInside && !reduceMotion && hoverIndex < 0);
      if (settling) kick();
    }

    /* ----- Input ----- */
    const setPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    };

    const onWheel = (e: WheelEvent) => {
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      const atStart = target <= 0 && dy < 0;
      const atEnd = target >= maxP && dy > 0;
      if (atStart || atEnd) return; // let the page scroll past the scene
      e.preventDefault();
      touchedInput();
      target = clampP(target + dy * 0.006);
      snapAt = performance.now() + 380;
      kick();
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      moved = false;
      downX = lastX = e.clientX;
      downY = lastY = e.clientY;
      downT = e.timeStamp; // event time, not handler time: a busy frame must not turn a tap into a long press
      lastMoveT = e.timeStamp;
      vel = 0;
      canvas.setPointerCapture(e.pointerId);
      setPointer(e);
      kick();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        pointerInside = true;
        setPointer(e);
      }
      if (dragging) {
        if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) {
          moved = true;
          touchedInput();
        }
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        const d = (Math.abs(dx) > Math.abs(dy) ? -dx : -dy) * 0.012;
        target = clampP(target + d);
        const seconds = Math.max(0.008, (e.timeStamp - lastMoveT) / 1000);
        lastMoveT = e.timeStamp;
        vel = vel * 0.5 + (d / seconds) * 0.5;
      }
      kick();
    };

    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      setPointer(e);
      if (!moved && e.timeStamp - downT < 600) {
        const index = pick();
        if (index >= 0) onOpenRef.current(cards[index].item.id);
      } else {
        snapAt = performance.now() + 450;
      }
      if (e.pointerType !== "mouse") pointerInside = false;
      kick();
    };

    const onLeave = () => {
      pointerInside = false;
      kick();
    };

    const go = (step: number) => {
      touchedInput();
      vel = 0;
      target = clampP(Math.round(target / BAY + step) * BAY);
      snapAt = 0;
      kick();
    };
    apiRef.current = { go };

    const onKey = (e: KeyboardEvent) => {
      const next = ["ArrowRight", "ArrowDown", "PageDown", " "];
      const prev = ["ArrowLeft", "ArrowUp", "PageUp"];
      if (next.includes(e.key)) go(1);
      else if (prev.includes(e.key)) go(-1);
      else if (e.key === "Home") go(-bays);
      else if (e.key === "End") go(bays);
      else return;
      e.preventDefault();
    };

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      camera.fov = aspect < 0.8 ? 84 : aspect < 1.2 ? 72 : 63;
      camera.updateProjectionMatrix();
      kick();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    host.addEventListener("keydown", onKey);
    const onLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    kick();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      observer.disconnect();
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      host.removeEventListener("keydown", onKey);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      canvas.remove();
    };
    // `key` covers the list; the layout values are derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (failed) return <>{fallback}</>;

  return (
    <div
      ref={hostRef}
      tabIndex={0}
      role="group"
      aria-label="3D shelf. Use the arrow keys or the buttons to walk along the aisle. The same tools are listed as links below."
      className="relative h-full w-full select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-blue-hover"
    >
      {/* Real links for screen readers, keyboards and search engines; the scene is an extra way in. */}
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={`/tool/${item.id}`}>{item.name}</Link>: {item.description}
          </li>
        ))}
      </ul>

      <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-4">
        <p
          className={`m-0 rounded-full bg-navy/85 px-4 py-2 text-center text-sm font-semibold text-white transition-opacity duration-500 ${hint ? "opacity-100" : "opacity-0"}`}
        >
          Drag, scroll or use the arrows to walk the aisle. Tap a tool to open it.
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-3 px-4">
        <div className={`max-w-md rounded-2xl bg-white/95 px-4 py-2.5 text-center shadow-card transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
          <p className="m-0 text-sm font-extrabold text-navy">{hovered?.name}</p>
          <p className="m-0 text-xs text-muted">{hovered?.description}</p>
        </div>
        <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-white/90 px-2 py-1.5 shadow-card">
          <button
            type="button"
            aria-label="Walk back"
            disabled={bay === 0}
            onClick={() => apiRef.current.go(-1)}
            className="grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-xl font-bold text-navy hover:bg-surface disabled:cursor-default disabled:opacity-30"
          >
            ‹
          </button>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: bays }).map((_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i === bay ? "w-6 bg-blue-hover" : "w-2 bg-navy/25"}`} />
            ))}
          </div>
          <button
            type="button"
            aria-label="Walk forward"
            disabled={bay === bays - 1}
            onClick={() => apiRef.current.go(1)}
            className="grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-xl font-bold text-navy hover:bg-surface disabled:cursor-default disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
