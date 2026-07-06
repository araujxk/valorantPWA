import React, { useState, useRef, useCallback, useEffect } from "react";
import { MapPin, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ZoomableMinimapProps {
  src: string;
  mapName: string;
  pin?: { x: number; y: number };
  standPin?: { x: number; y: number };
  angle?: number;           // radians – external controlled angle for line/cone
  onPinPlace?: (x: number, y: number) => void;
  onAngleChange?: (angle: number) => void;
  className?: string;
  abilityId?: string;
  activePinMode?: 'player' | 'target';
}

// ─── Overlay Types ────────────────────────────────────────────────────────────
type OverlayShape = "circle" | "line" | "cone";

interface AbilityOverlay {
  shape: OverlayShape;
  label: string;
  color: string;
  borderColor: string;
  borderDash?: boolean;
  pulse?: boolean;
  radius?: number;
  lineLength?: number;
  coneAngle?: number;
  coneRadius?: number;
}

// ─── Ability Overlay Table ────────────────────────────────────────────────────
const ABILITY_OVERLAYS: Record<string, AbilityOverlay> = {
  // SMOKES (circle)
  sky_smoke: { shape: "circle", radius: 0.033, color: "rgba(249,115,22,0.20)", borderColor: "rgba(249,115,22,0.90)", label: "Sky Smoke" },
  dark_cover: { shape: "circle", radius: 0.032, color: "rgba(139,92,246,0.20)", borderColor: "rgba(139,92,246,0.90)", label: "Dark Cover" },
  poison_cloud: { shape: "circle", radius: 0.034, color: "rgba(34,197,94,0.20)", borderColor: "rgba(34,197,94,0.90)", label: "Poison Cloud" },
  ruse: { shape: "circle", radius: 0.035, color: "rgba(244,114,182,0.20)", borderColor: "rgba(244,114,182,0.90)", label: "Ruse" },
  cloudburst: { shape: "circle", radius: 0.026, color: "rgba(148,163,184,0.20)", borderColor: "rgba(148,163,184,0.90)", label: "Cloudburst" },
  nebula: { shape: "circle", radius: 0.036, color: "rgba(168,85,247,0.20)", borderColor: "rgba(168,85,247,0.90)", label: "Nebula" },
  cyber_cage: { shape: "circle", radius: 0.025, color: "rgba(113,113,122,0.22)", borderColor: "rgba(113,113,122,0.90)", label: "Cyber Cage" },
  cove: { shape: "circle", radius: 0.030, color: "rgba(6,182,212,0.20)", borderColor: "rgba(6,182,212,0.90)", label: "Cove" },
  // SCANS / REVEAL
  recon_bolt: { shape: "circle", radius: 0.14, color: "rgba(56,189,248,0.10)", borderColor: "rgba(56,189,248,0.65)", borderDash: true, pulse: true, label: "Recon Bolt 30m" },
  haunt: { shape: "circle", radius: 0.11, color: "rgba(99,102,241,0.10)", borderColor: "rgba(99,102,241,0.65)", borderDash: true, pulse: true, label: "Haunt Reveal 20m" },
  zero_point: { shape: "circle", radius: 0.13, color: "rgba(6,182,212,0.10)", borderColor: "rgba(6,182,212,0.65)", borderDash: true, pulse: true, label: "ZERO/point" },
  lockdown: { shape: "circle", radius: 0.17, color: "rgba(234,179,8,0.08)", borderColor: "rgba(234,179,8,0.65)", borderDash: true, pulse: true, label: "Lockdown 32.5m" },
  alarmbot: { shape: "circle", radius: 0.050, color: "rgba(234,179,8,0.15)", borderColor: "rgba(234,179,8,0.75)", pulse: true, label: "Alarmbot" },
  seize: { shape: "circle", radius: 0.038, color: "rgba(99,102,241,0.18)", borderColor: "rgba(99,102,241,0.80)", pulse: true, label: "Seize" },
  sonic_sensor: { shape: "circle", radius: 0.055, color: "rgba(226,232,240,0.10)", borderColor: "rgba(226,232,240,0.55)", borderDash: true, pulse: true, label: "Sonic Sensor" },
  owl_drone: { shape: "circle", radius: 0.10, color: "rgba(56,189,248,0.08)", borderColor: "rgba(56,189,248,0.50)", borderDash: true, label: "Owl Drone" },
  spycam: { shape: "circle", radius: 0.09, color: "rgba(113,113,122,0.12)", borderColor: "rgba(113,113,122,0.60)", borderDash: true, label: "Spycam LoS" },
  null_cmd: { shape: "circle", radius: 0.15, color: "rgba(6,182,212,0.10)", borderColor: "rgba(6,182,212,0.55)", borderDash: true, pulse: true, label: "NULL/cmd" },
  // MOLLY / AOE
  incendiary: { shape: "circle", radius: 0.030, color: "rgba(239,68,68,0.25)", borderColor: "rgba(239,68,68,0.85)", pulse: true, label: "Incendiary" },
  snake_bite: { shape: "circle", radius: 0.030, color: "rgba(34,197,94,0.25)", borderColor: "rgba(34,197,94,0.85)", pulse: true, label: "Snake Bite" },
  hot_hands: { shape: "circle", radius: 0.027, color: "rgba(251,146,60,0.25)", borderColor: "rgba(251,146,60,0.85)", pulse: true, label: "Hot Hands" },
  nanoswarm: { shape: "circle", radius: 0.028, color: "rgba(234,179,8,0.25)", borderColor: "rgba(234,179,8,0.85)", pulse: true, label: "Nanoswarm" },
  mosh_pit: { shape: "circle", radius: 0.038, color: "rgba(132,204,22,0.25)", borderColor: "rgba(132,204,22,0.85)", pulse: true, label: "Mosh Pit" },
  frag_ment: { shape: "circle", radius: 0.032, color: "rgba(6,182,212,0.22)", borderColor: "rgba(6,182,212,0.85)", pulse: true, label: "FRAG/ment" },
  shock_bolt: { shape: "circle", radius: 0.032, color: "rgba(56,189,248,0.22)", borderColor: "rgba(56,189,248,0.85)", pulse: true, label: "Shock Bolt" },
  orbital_strike: { shape: "circle", radius: 0.065, color: "rgba(220,38,38,0.28)", borderColor: "rgba(220,38,38,0.95)", pulse: true, label: "Orbital Strike" },
  vipers_pit: { shape: "circle", radius: 0.14, color: "rgba(34,197,94,0.14)", borderColor: "rgba(34,197,94,0.65)", borderDash: true, label: "Viper's Pit" },
  slow_orb: { shape: "circle", radius: 0.035, color: "rgba(125,211,252,0.22)", borderColor: "rgba(125,211,252,0.80)", label: "Slow Orb" },
  healing_orb: { shape: "circle", radius: 0.030, color: "rgba(20,184,166,0.22)", borderColor: "rgba(20,184,166,0.80)", label: "Healing Orb" },
  reckoning: { shape: "circle", radius: 0.045, color: "rgba(6,182,212,0.18)", borderColor: "rgba(6,182,212,0.75)", pulse: true, label: "Reckoning" },
  gravity_well: { shape: "circle", radius: 0.038, color: "rgba(168,85,247,0.22)", borderColor: "rgba(168,85,247,0.85)", pulse: true, label: "Gravity Well" },
  nova_pulse: { shape: "circle", radius: 0.040, color: "rgba(168,85,247,0.20)", borderColor: "rgba(168,85,247,0.85)", pulse: true, label: "Nova Pulse" },
  regrowth: { shape: "circle", radius: 0.035, color: "rgba(132,204,22,0.18)", borderColor: "rgba(132,204,22,0.75)", label: "Regrowth" },
  aftershock: { shape: "circle", radius: 0.028, color: "rgba(249,115,22,0.22)", borderColor: "rgba(249,115,22,0.85)", pulse: true, label: "Aftershock" },
  annihilation: { shape: "circle", radius: 0.035, color: "rgba(226,232,240,0.18)", borderColor: "rgba(226,232,240,0.75)", pulse: true, label: "Annihilation" },
  // WALLS / LINE  (half-length each side, fraction of image width)
  toxic_screen: { shape: "line", lineLength: 0.35, color: "rgba(34,197,94,0.18)", borderColor: "rgba(34,197,94,0.85)", borderDash: true, label: "Toxic Screen" },
  cosmic_divide: { shape: "line", lineLength: 0.45, color: "rgba(168,85,247,0.15)", borderColor: "rgba(168,85,247,0.85)", label: "Cosmic Divide" },
  blaze: { shape: "line", lineLength: 0.08, color: "rgba(251,146,60,0.22)", borderColor: "rgba(251,146,60,0.90)", label: "Blaze" },
  fast_lane: { shape: "line", lineLength: 0.12, color: "rgba(56,189,248,0.18)", borderColor: "rgba(56,189,248,0.85)", label: "Fast Lane" },
  high_tide: { shape: "line", lineLength: 0.28, color: "rgba(6,182,212,0.18)", borderColor: "rgba(6,182,212,0.85)", label: "High Tide" },
  cascade: { shape: "line", lineLength: 0.14, color: "rgba(6,182,212,0.16)", borderColor: "rgba(6,182,212,0.75)", borderDash: true, label: "Cascade" },
  barrier_orb: { shape: "line", lineLength: 0.05, color: "rgba(125,211,252,0.22)", borderColor: "rgba(125,211,252,0.85)", label: "Barrier Orb" },
  trapwire: { shape: "line", lineLength: 0.08, color: "rgba(113,113,122,0.22)", borderColor: "rgba(113,113,122,0.85)", borderDash: true, label: "Trapwire" },
  hunters_fury: { shape: "line", lineLength: 0.48, color: "rgba(56,189,248,0.14)", borderColor: "rgba(56,189,248,0.80)", label: "Hunter's Fury" },
  contingency: { shape: "line", lineLength: 0.11, color: "rgba(139,92,246,0.18)", borderColor: "rgba(139,92,246,0.85)", label: "Contingency" },
  barrier_mesh: { shape: "line", lineLength: 0.07, color: "rgba(226,232,240,0.18)", borderColor: "rgba(226,232,240,0.80)", label: "Barrier Mesh" },
  // CONES / FAN (coneAngle degrees, coneRadius fraction)
  rolling_thunder: { shape: "cone", coneAngle: 80, coneRadius: 0.33, color: "rgba(249,115,22,0.18)", borderColor: "rgba(249,115,22,0.85)", label: "Rolling Thunder" },
  nightfall: { shape: "cone", coneAngle: 110, coneRadius: 0.42, color: "rgba(99,102,241,0.14)", borderColor: "rgba(99,102,241,0.80)", pulse: true, label: "Nightfall" },
  fault_line: { shape: "cone", coneAngle: 60, coneRadius: 0.25, color: "rgba(249,115,22,0.15)", borderColor: "rgba(249,115,22,0.80)", borderDash: true, label: "Fault Line" },
  turret: { shape: "cone", coneAngle: 180, coneRadius: 0.18, color: "rgba(234,179,8,0.12)", borderColor: "rgba(234,179,8,0.70)", borderDash: true, label: "Turret 180°" },
  trailblazer: { shape: "cone", coneAngle: 55, coneRadius: 0.22, color: "rgba(132,204,22,0.16)", borderColor: "rgba(132,204,22,0.75)", label: "Trailblazer" },
  guiding_light: { shape: "cone", coneAngle: 65, coneRadius: 0.26, color: "rgba(132,204,22,0.14)", borderColor: "rgba(132,204,22,0.70)", borderDash: true, label: "Guiding Light" },
  prowler: { shape: "cone", coneAngle: 50, coneRadius: 0.20, color: "rgba(99,102,241,0.16)", borderColor: "rgba(99,102,241,0.75)", label: "Prowler" },
  gravnet: { shape: "cone", coneAngle: 45, coneRadius: 0.18, color: "rgba(226,232,240,0.16)", borderColor: "rgba(226,232,240,0.75)", label: "Gravnet" },
  seekers: { shape: "cone", coneAngle: 90, coneRadius: 0.30, color: "rgba(132,204,22,0.12)", borderColor: "rgba(132,204,22,0.65)", borderDash: true, pulse: true, label: "Seekers" },

  // FLASHES / BLINDS (small circles — zone of effect at landing)
  curveball: { shape: "circle", radius: 0.028, color: "rgba(251,146,60,0.22)", borderColor: "rgba(251,146,60,0.85)", pulse: true, label: "Curveball Flash" },
  leer: { shape: "circle", radius: 0.028, color: "rgba(220,38,38,0.22)", borderColor: "rgba(220,38,38,0.85)", pulse: true, label: "Leer Blind" },
  blindside: { shape: "circle", radius: 0.030, color: "rgba(113,113,122,0.22)", borderColor: "rgba(113,113,122,0.85)", pulse: true, label: "Blindside Flash" },
  relay_bolt: { shape: "circle", radius: 0.032, color: "rgba(56,189,248,0.22)", borderColor: "rgba(56,189,248,0.85)", pulse: true, label: "Relay Bolt" },
  flash_drive: { shape: "circle", radius: 0.030, color: "rgba(6,182,212,0.22)", borderColor: "rgba(6,182,212,0.85)", pulse: true, label: "FLASH/drive" },
  dizzy: { shape: "circle", radius: 0.028, color: "rgba(132,204,22,0.22)", borderColor: "rgba(132,204,22,0.85)", pulse: true, label: "Dizzy Flash" },

  // PROJECTILES / FORWARD LINES (line going in cast direction)
  paranoia: { shape: "line", lineLength: 0.40, color: "rgba(139,92,246,0.14)", borderColor: "rgba(139,92,246,0.80)", label: "Paranoia" },
  flashpoint: { shape: "line", lineLength: 0.12, color: "rgba(249,115,22,0.18)", borderColor: "rgba(249,115,22,0.80)", borderDash: true, label: "Flashpoint" },
  undercut: { shape: "line", lineLength: 0.30, color: "rgba(139,92,246,0.16)", borderColor: "rgba(139,92,246,0.80)", borderDash: true, label: "Undercut" },

  // EXPLOSIONS / AREA GRENADES
  blast_pack: { shape: "circle", radius: 0.028, color: "rgba(220,38,38,0.28)", borderColor: "rgba(220,38,38,0.90)", pulse: true, label: "Blast Pack" },
  paint_shells: { shape: "circle", radius: 0.055, color: "rgba(220,38,38,0.22)", borderColor: "rgba(220,38,38,0.85)", pulse: true, label: "Paint Shells" },
  showstopper: { shape: "circle", radius: 0.075, color: "rgba(220,38,38,0.25)", borderColor: "rgba(220,38,38,0.95)", pulse: true, label: "Showstopper" },
  thrash: { shape: "circle", radius: 0.032, color: "rgba(132,204,22,0.25)", borderColor: "rgba(132,204,22,0.85)", pulse: true, label: "Thrash" },
  wingman: { shape: "circle", radius: 0.025, color: "rgba(132,204,22,0.18)", borderColor: "rgba(132,204,22,0.75)", label: "Wingman" },
  meddle: { shape: "circle", radius: 0.030, color: "rgba(244,114,182,0.22)", borderColor: "rgba(244,114,182,0.85)", pulse: true, label: "Meddle Decay" },

  // UTILITY / AREA BUFFS/DETECTION
  stim_beacon: { shape: "circle", radius: 0.030, color: "rgba(249,115,22,0.18)", borderColor: "rgba(249,115,22,0.70)", label: "Stim Beacon" },
  boom_bot: { shape: "circle", radius: 0.035, color: "rgba(220,38,38,0.15)", borderColor: "rgba(220,38,38,0.65)", borderDash: true, label: "Boom Bot Patrol" },
  trademark: { shape: "circle", radius: 0.060, color: "rgba(226,232,240,0.12)", borderColor: "rgba(226,232,240,0.65)", borderDash: true, pulse: true, label: "Trademark Scan" },
  tour_de_force: { shape: "circle", radius: 0.032, color: "rgba(226,232,240,0.20)", borderColor: "rgba(226,232,240,0.80)", label: "Tour de Force Slow" },
  pick_me_up: { shape: "circle", radius: 0.025, color: "rgba(244,114,182,0.18)", borderColor: "rgba(244,114,182,0.70)", label: "Pick-me-up Range" },
};

// ─── Shape renderers (SVG, viewBox 0 0 1 1) ──────────────────────────────────
function CircleOverlay({ pin, ov }: { pin: { x: number; y: number }; ov: AbilityOverlay }) {
  const r = ov.radius ?? 0.04;
  return (
    <div
      className={`absolute pointer-events-none rounded-full border-2 ${ov.borderDash ? "border-dashed" : "border-solid"} ${ov.pulse ? "animate-pulse" : ""}`}
      style={{
        left: `${pin.x * 100}%`, top: `${pin.y * 100}%`,
        width: `${r * 2 * 100}%`, height: `${r * 2 * 100}%`,
        transform: "translate(-50%,-50%)",
        backgroundColor: ov.color, borderColor: ov.borderColor,
        boxShadow: ov.pulse ? `0 0 8px ${ov.borderColor}` : "none",
      }}
    />
  );
}

function LineOverlay({ pin, ov, angle }: { pin: { x: number; y: number }; ov: AbilityOverlay; angle: number }) {
  const half = ov.lineLength ?? 0.2;
  const { x: cx, y: cy } = pin;
  const stroke = ov.borderColor;
  const dash = ov.borderDash ? "0.015,0.008" : "none";
  const deg = angle * (180 / Math.PI);
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${ov.pulse ? "animate-pulse" : ""}`}
      viewBox="0 0 1 1" preserveAspectRatio="none"
      style={{ overflow: "visible" }}
    >
      <g transform={`rotate(${deg}, ${cx}, ${cy})`}>
        {/* fill strip */}
        <rect x={cx - half} y={cy - 0.006} width={half * 2} height={0.012} fill={ov.color} opacity={0.55} />
        {/* main line */}
        <line x1={cx - half} y1={cy} x2={cx + half} y2={cy}
          stroke={stroke} strokeWidth={0.006} strokeDasharray={dash} strokeLinecap="round" />
        {/* arrow heads */}
        <polygon points={`${cx - half},${cy} ${cx - half + 0.02},${cy - 0.012} ${cx - half + 0.02},${cy + 0.012}`} fill={stroke} opacity={0.85} />
        <polygon points={`${cx + half},${cy} ${cx + half - 0.02},${cy - 0.012} ${cx + half - 0.02},${cy + 0.012}`} fill={stroke} opacity={0.85} />
        {/* center dot */}
        <circle cx={cx} cy={cy} r={0.008} fill={stroke} opacity={0.9} />
      </g>
    </svg>
  );
}

function ConeOverlay({ pin, ov, angle }: { pin: { x: number; y: number }; ov: AbilityOverlay; angle: number }) {
  const halfAngle = ((ov.coneAngle ?? 90) * Math.PI) / 360;
  const r = ov.coneRadius ?? 0.25;
  const { x: cx, y: cy } = pin;
  const x1 = cx + r * Math.cos(-halfAngle);
  const y1 = cy + r * Math.sin(-halfAngle);
  const x2 = cx + r * Math.cos(halfAngle);
  const y2 = cy + r * Math.sin(halfAngle);
  const largeArc = (ov.coneAngle ?? 90) > 180 ? 1 : 0;
  const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  const stroke = ov.borderColor;
  const dash = ov.borderDash ? "0.015,0.008" : "none";
  const deg = angle * (180 / Math.PI);
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${ov.pulse ? "animate-pulse" : ""}`}
      viewBox="0 0 1 1" preserveAspectRatio="none"
      style={{ overflow: "visible" }}
    >
      <g transform={`rotate(${deg}, ${cx}, ${cy})`}>
        <path d={pathD} fill={ov.color} stroke={stroke} strokeWidth={0.005} strokeDasharray={dash} strokeLinejoin="round" />
        <circle cx={cx} cy={cy} r={0.008} fill={stroke} opacity={0.9} />
      </g>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const MIN_SCALE = 1, MAX_SCALE = 6;

export default function ZoomableMinimap({
  src, mapName, pin, standPin, angle: externalAngle, onPinPlace, onAngleChange, className = "", abilityId, activePinMode = 'target'
}: ZoomableMinimapProps) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [internalAngle, setInternalAngle] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const lastPinchDist = useRef<number | null>(null);
  const scaleRef = useRef(1), txRef = useRef(0), tyRef = useRef(0);
  const isDraggingHandleRef = useRef(false);

  // Use external angle if provided (controlled), else internal state
  const angle = externalAngle !== undefined ? externalAngle : internalAngle;
  const setAngle = useCallback((a: number) => {
    setInternalAngle(a);
    if (onAngleChange) onAngleChange(a);
  }, [onAngleChange]);

  // Reset angle when pin changes (new pin placement)
  const prevPinRef = useRef(pin);
  useEffect(() => {
    if (pin && (!prevPinRef.current || prevPinRef.current.x !== pin.x || prevPinRef.current.y !== pin.y)) {
      if (!externalAngle) setInternalAngle(0);
    }
    prevPinRef.current = pin;
  }, [pin, externalAngle]);

  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { txRef.current = tx; }, [tx]);
  useEffect(() => { tyRef.current = ty; }, [ty]);
  useEffect(() => { isDraggingHandleRef.current = isDraggingHandle; }, [isDraggingHandle]);

  const clamp = useCallback((nx: number, ny: number, s: number) => {
    if (!containerRef.current) return { x: nx, y: ny };
    const W = containerRef.current.offsetWidth, H = containerRef.current.offsetHeight;
    return { x: Math.max(-(W * (s - 1)) / 2, Math.min((W * (s - 1)) / 2, nx)), y: Math.max(-(H * (s - 1)) / 2, Math.min((H * (s - 1)) / 2, ny)) };
  }, []);

  const applyZoom = useCallback((ns: number, px: number, py: number) => {
    const s = Math.max(MIN_SCALE, Math.min(MAX_SCALE, ns));
    const f = s / scaleRef.current;
    const c = clamp(px + (txRef.current - px) * f, py + (tyRef.current - py) * f, s);
    setScale(s); setTx(c.x); setTy(c.y);
  }, [clamp]);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    applyZoom(scaleRef.current * (e.deltaY < 0 ? 1.12 : 0.89), e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
  }, [applyZoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // Convert viewport coords → image [0,1] coords
  const toImageCoords = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0.5, y: 0.5 };
    const r = containerRef.current.getBoundingClientRect();
    const W = r.width, H = r.height;
    return {
      x: Math.max(0, Math.min(1, (clientX - r.left - W / 2 - txRef.current) / scaleRef.current / W + 0.5)),
      y: Math.max(0, Math.min(1, (clientY - r.top - H / 2 - tyRef.current) / scaleRef.current / H + 0.5)),
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (isDraggingHandleRef.current) return;
    setIsDragging(true); setHasMoved(false);
    dragOrigin.current = { x: e.clientX, y: e.clientY, tx: txRef.current, ty: tyRef.current };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDraggingHandleRef.current && pin) {
      const img = toImageCoords(e.clientX, e.clientY);
      setAngle(Math.atan2(img.y - pin.y, img.x - pin.x));
      return;
    }
    if (!isDragging) return;
    const dx = e.clientX - dragOrigin.current.x, dy = e.clientY - dragOrigin.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) setHasMoved(true);
    const c = clamp(dragOrigin.current.tx + dx, dragOrigin.current.ty + dy, scaleRef.current);
    setTx(c.x); setTy(c.y);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (isDraggingHandleRef.current) { setIsDraggingHandle(false); isDraggingHandleRef.current = false; return; }
    setIsDragging(false);
    if (!hasMoved && onPinPlace) {
      const img = toImageCoords(e.clientX, e.clientY);
      onPinPlace(parseFloat(img.x.toFixed(3)), parseFloat(img.y.toFixed(3)));
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) { setIsDragging(true); setHasMoved(false); dragOrigin.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, tx: txRef.current, ty: tyRef.current }; }
    else if (e.touches.length === 2) lastPinchDist.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragOrigin.current.x, dy = e.touches[0].clientY - dragOrigin.current.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) setHasMoved(true);
      const c = clamp(dragOrigin.current.tx + dx, dragOrigin.current.ty + dy, scaleRef.current);
      setTx(c.x); setTy(c.y);
    } else if (e.touches.length === 2 && lastPinchDist.current !== null && containerRef.current) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const r = containerRef.current.getBoundingClientRect();
      applyZoom(scaleRef.current * dist / lastPinchDist.current, (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left - r.width / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top - r.height / 2);
      lastPinchDist.current = dist;
    }
  };
  const onTouchEnd = () => { setIsDragging(false); lastPinchDist.current = null; };

  const zoomIn = (e: React.MouseEvent) => { e.stopPropagation(); applyZoom(scaleRef.current * 1.4, 0, 0); };
  const zoomOut = (e: React.MouseEvent) => { e.stopPropagation(); applyZoom(scaleRef.current / 1.4, 0, 0); };
  const reset = (e: React.MouseEvent) => { e.stopPropagation(); setScale(1); setTx(0); setTy(0); };

  const overlay = abilityId ? ABILITY_OVERLAYS[abilityId.toLowerCase()] : undefined;
  const isDirectional = overlay && (overlay.shape === "line" || overlay.shape === "cone");

  // Handle position (in image 0-1 space) – where the user drags to rotate
  const handleDist = overlay?.shape === "line"
    ? (overlay.lineLength ?? 0.2)
    : overlay?.shape === "cone"
      ? (overlay.coneRadius ?? 0.25)
      : 0;
  const handleImgX = pin ? pin.x + handleDist * Math.cos(angle) : 0;
  const handleImgY = pin ? pin.y + handleDist * Math.sin(angle) : 0;

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl bg-slate-900 border border-slate-700 select-none ${className}`}
      style={{ overflow: isDirectional && isDraggingHandle ? "visible" : "hidden", cursor: isDraggingHandle ? "crosshair" : isDragging ? "grabbing" : onPinPlace ? "crosshair" : "grab", touchAction: "none" }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
      onMouseLeave={() => { setIsDragging(false); setIsDraggingHandle(false); isDraggingHandleRef.current = false; }}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
      {/* Transformed layer (zoom + pan) */}
      <div className="absolute inset-0" style={{ transform: `translate(${tx}px,${ty}px) scale(${scale})`, transformOrigin: "center", transition: isDragging ? "none" : "transform 0.08s ease-out", willChange: "transform" }}>
        <img src={src} alt={`Mini-mapa ${mapName}`} className="w-full h-full object-contain pointer-events-none" draggable={false} />

        {/* Ability shape overlay */}
        {pin && overlay && overlay.shape === "circle" && <CircleOverlay pin={pin} ov={overlay} />}
        {pin && overlay && overlay.shape === "line" && <LineOverlay pin={pin} ov={overlay} angle={angle} />}
        {pin && overlay && overlay.shape === "cone" && <ConeOverlay pin={pin} ov={overlay} angle={angle} />}

        {/* Trajectory connection line */}
        {standPin && pin && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
            style={{ overflow: "visible", zIndex: 10 }}
          >
            <defs>
              <marker
                id="trajectory-arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
              </marker>
            </defs>
            <line
              x1={standPin.x}
              y1={standPin.y}
              x2={pin.x}
              y2={pin.y}
              stroke="#3b82f6"
              strokeWidth={0.0035}
              strokeDasharray="0.012,0.008"
              markerEnd="url(#trajectory-arrow)"
            />
          </svg>
        )}

        {/* Rotation handle – only for line/cone */}
        {pin && isDirectional && onPinPlace && (
          <div
            className="absolute z-20 flex items-center justify-center"
            style={{
              left: `${handleImgX * 100}%`, top: `${handleImgY * 100}%`,
              transform: `translate(-50%,-50%) scale(${1 / scale})`,
              transformOrigin: "center",
              pointerEvents: "auto",
              cursor: "grab",
            }}
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setIsDraggingHandle(true); isDraggingHandleRef.current = true; }}
            title="Arrastar para rodar"
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-transform hover:scale-110"
              style={{ backgroundColor: overlay.borderColor }}
            >
              <RotateCcw className="w-3 h-3 text-white" />
            </div>
          </div>
        )}

        {/* Player stand pin */}
        {standPin && (
          <div className="absolute pointer-events-none"
            style={{ left: `${standPin.x * 100}%`, top: `${standPin.y * 100}%`, transform: `translate(-50%,-100%) scale(${1 / scale})`, transformOrigin: "bottom center", zIndex: 15 }}>
            <MapPin className="w-8 h-8 text-blue-500 fill-blue-500 drop-shadow-lg" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500/30 rounded-full animate-ping" />
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 border border-blue-400 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow leading-none uppercase select-none">
              Jogador
            </div>
          </div>
        )}

        {/* Location / Landing pin */}
        {pin && (
          <div className="absolute pointer-events-none"
            style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%`, transform: `translate(-50%,-100%) scale(${1 / scale})`, transformOrigin: "bottom center", zIndex: 15 }}>
            <MapPin className="w-8 h-8 text-red-500 fill-red-500 drop-shadow-lg" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500/30 rounded-full animate-ping" />
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red-600 border border-red-400 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow leading-none uppercase select-none">
              Alvo
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-1 z-10">
        <button onClick={zoomIn} className="w-7 h-7 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center justify-center text-slate-300 transition-colors shadow" title="Zoom +"><ZoomIn className="w-3.5 h-3.5" /></button>
        <button onClick={zoomOut} className="w-7 h-7 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center justify-center text-slate-300 transition-colors shadow" title="Zoom -"><ZoomOut className="w-3.5 h-3.5" /></button>
        <button onClick={reset} className="w-7 h-7 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center justify-center text-slate-300 transition-colors shadow" title="Reset"><RotateCcw className="w-3.5 h-3.5" /></button>
      </div>

      {/* Map Legend */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 bg-slate-950/90 p-2 rounded-lg border border-slate-800 text-[9px] font-bold shadow-lg">
        {scale > 1.05 && <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800 mb-1">Zoom: {scale.toFixed(1)}x</div>}
        <div className="flex items-center gap-1.5 text-blue-400">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
          <span>JOGADOR</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm" />
          <span>ALVO</span>
        </div>
      </div>

      {onPinPlace && scale <= 1.05 && (
        <div className="absolute bottom-2 left-2 z-10 text-[9px] text-slate-400 bg-slate-950/90 px-2 py-1 rounded-lg pointer-events-none border border-slate-850">
          {activePinMode === 'player'
            ? "🔵 Clique no mapa para definir a posição do JOGADOR"
            : isDirectional
              ? "🔴 Clique para definir o ALVO · ⟳ Gire o botão para rodar"
              : "🔴 Clique no mapa para definir o ALVO da habilidade"
          }
        </div>
      )}

      {overlay && pin && (
        <div className="absolute top-2 right-2 z-10 text-[9px] font-bold px-2 py-0.5 rounded-lg"
          style={{ color: overlay.borderColor, backgroundColor: overlay.color, border: `1px solid ${overlay.borderColor}` }}>
          {overlay.shape === "line" ? "↔ " : overlay.shape === "cone" ? "▶ " : "◎ "}{overlay.label}
        </div>
      )}
    </div>
  );
}
