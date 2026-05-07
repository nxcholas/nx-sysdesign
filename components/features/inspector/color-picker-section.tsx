'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  hexToHsv,
  hsvToHex,
  hsvToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToHex,
  isValidHex,
  normalizeHex,
  clamp,
  parseColor,
  toColorString,
  type HSV,
} from '@/lib/color-utils';
import { useRecentColors } from '@/hooks/useRecentColors';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRESET_COLORS = [
  '#FFFFFF', '#E5E7EB', '#9CA3AF', '#374151',
  '#111827', '#1E293B', '#38BDF8', '#3B82F6',
  '#6366F1', '#8B5CF6', '#10B981', '#84CC16',
  '#F59E0B', '#F97316', '#F43F5E', '#EF4444',
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ColorPickerSectionProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  allowTransparent?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

// ---------------------------------------------------------------------------
// Checkerboard pattern (for opacity slider background)
// ---------------------------------------------------------------------------

const CHECKERBOARD =
  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\'%3E%3Crect width=\'4\' height=\'4\' fill=\'%23555\'/%3E%3Crect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'%23555\'/%3E%3Crect x=\'4\' width=\'4\' height=\'4\' fill=\'%23888\'/%3E%3Crect y=\'4\' width=\'4\' height=\'4\' fill=\'%23888\'/%3E%3C/svg%3E")';

// ---------------------------------------------------------------------------
// ColorPickerSection
// ---------------------------------------------------------------------------

export function ColorPickerSection({
  label,
  value,
  onChange,
  allowTransparent = false,
  isOpen,
  onToggle,
}: ColorPickerSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const { recentColors, pushColor } = useRecentColors();

  // --- Internal HSV + alpha state ---
  const isTransparent = value === 'transparent';
  const parsed = isTransparent ? null : parseColor(value);
  const safeHex = parsed ? rgbToHex(parsed) : '#000000';
  const safeAlpha = parsed ? parsed.a : 100;

  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(safeHex));
  const [alpha, setAlpha] = useState(safeAlpha);
  const [transparent, setTransparent] = useState(isTransparent);

  // Hex input local state (allows invalid mid-typing states)
  const [hexInput, setHexInput] = useState(safeHex);
  const [hexError, setHexError] = useState(false);

  // RGB local inputs
  const rgb = hsvToRgb(hsv);
  const hsl = rgbToHsl(rgb);

  // --- Sync from prop when picker opens ---
  const prevIsOpen = useRef(false);
  const capturedPointerIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      const isT = value === 'transparent';
      setTransparent(isT);
      const p = isT ? null : parseColor(value);
      const hex = p ? rgbToHex(p) : '#000000';
      setHsv(hexToHsv(hex));
      setAlpha(p ? p.a : 100);
      setHexInput(hex);
      setHexError(false);
    }
    // Release any lingering pointer capture when the accordion closes
    if (!isOpen && capturedPointerIdRef.current !== null && canvasRef.current) {
      try { canvasRef.current.releasePointerCapture(capturedPointerIdRef.current); } catch { /* ignore */ }
      capturedPointerIdRef.current = null;
      isDragging.current = false;
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, value]);

  // Keep hexInput in sync with HSV changes (unless user is typing)
  const isTypingHex = useRef(false);
  useEffect(() => {
    if (!isTypingHex.current) {
      setHexInput(hsvToHex(hsv));
    }
  }, [hsv]);

  // --- Canvas ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;

    // Base hue fill
    ctx.fillStyle = `hsl(${hsv.h}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    // White left-to-right gradient
    const whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);

    // Black top-to-bottom gradient
    const blackGrad = ctx.createLinearGradient(0, 0, 0, height);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, width, height);
  }, [hsv.h]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const pickFromCanvas = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
      const next: HSV = { h: hsv.h, s: x, v: 1 - y };
      setHsv(next);
      if (!transparent) onChange(toColorString(hsvToRgb(next), alpha));
    },
    [hsv.h, alpha, transparent, onChange]
  );

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    capturedPointerIdRef.current = e.pointerId;
    canvasRef.current?.setPointerCapture(e.pointerId);
    pickFromCanvas(e);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    pickFromCanvas(e);
  };

  const releaseCanvasCapture = (pointerId: number) => {
    isDragging.current = false;
    capturedPointerIdRef.current = null;
    try { canvasRef.current?.releasePointerCapture(pointerId); } catch { /* ignore */ }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    releaseCanvasCapture(e.pointerId);
    if (!transparent) {
      const hex = hsvToHex(hsv);
      pushColor(hex);
    }
  };

  const handleCanvasPointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    releaseCanvasCapture(e.pointerId);
  };

  const handleCanvasKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const step = 0.01;
    let next = { ...hsv };
    if (e.key === 'ArrowLeft') next = { ...hsv, s: clamp(hsv.s - step, 0, 1) };
    if (e.key === 'ArrowRight') next = { ...hsv, s: clamp(hsv.s + step, 0, 1) };
    if (e.key === 'ArrowUp') next = { ...hsv, v: clamp(hsv.v + step, 0, 1) };
    if (e.key === 'ArrowDown') next = { ...hsv, v: clamp(hsv.v - step, 0, 1) };
    if (next !== hsv) {
      e.preventDefault();
      setHsv(next);
      if (!transparent) onChange(toColorString(hsvToRgb(next), alpha));
    }
  };

  // --- Hue slider ---
  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = Number(e.target.value);
    const next: HSV = { ...hsv, h };
    setHsv(next);
    if (!transparent) onChange(toColorString(hsvToRgb(next), alpha));
  };

  // --- Alpha slider ---
  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = Number(e.target.value);
    setAlpha(a);
    if (!transparent) onChange(toColorString(hsvToRgb(hsv), a));
  };

  // --- Hex input ---
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isTypingHex.current = true;
    const raw = e.target.value;
    setHexInput(raw);
    const withHash = raw.startsWith('#') ? raw : `#${raw}`;
    if (isValidHex(withHash)) {
      setHexError(false);
      const norm = normalizeHex(withHash);
      const next = hexToHsv(norm);
      setHsv(next);
      if (!transparent) onChange(toColorString(hsvToRgb(next), alpha));
    } else {
      setHexError(true);
    }
  };

  const handleHexBlur = () => {
    isTypingHex.current = false;
    const withHash = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
    if (!isValidHex(withHash)) {
      const fallback = hsvToHex(hsv);
      setHexInput(fallback);
      setHexError(false);
    } else {
      setHexInput(normalizeHex(withHash));
      setHexError(false);
    }
  };

  // --- RGB inputs ---
  const handleRgbChange = (channel: 'r' | 'g' | 'b', val: number) => {
    const clamped = clamp(Math.round(val), 0, 255);
    const next = { ...rgb, [channel]: clamped };
    const nextHsv = { ...hexToHsv(rgbToHex(next)), h: hsv.h };
    // Only update h if saturation > 0 to avoid hue reset
    const resolved = next.r === 0 && next.g === 0 && next.b === 0
      ? { ...nextHsv, h: hsv.h }
      : hexToHsv(rgbToHex(next));
    setHsv(resolved);
    if (!transparent) onChange(toColorString(next, alpha));
  };

  // --- HSL inputs ---
  const handleHslChange = (channel: 'h' | 's' | 'l', val: number) => {
    const max = channel === 'h' ? 360 : 100;
    const clamped = clamp(Math.round(val), 0, max);
    const nextHsl = { ...hsl, [channel]: clamped };
    const nextRgb = hslToRgb(nextHsl);
    const nextHsv = hexToHsv(rgbToHex(nextRgb));
    // Preserve hue from hsl input if changed
    setHsv(channel === 'h' ? { ...nextHsv, h: clamped } : nextHsv);
    if (!transparent) onChange(toColorString(nextRgb, alpha));
  };

  // --- Swatch selection ---
  const handleSwatchClick = (color: string) => {
    const p = parseColor(color);
    if (!p) return;
    const hex = rgbToHex(p);
    setHsv(hexToHsv(hex));
    setAlpha(p.a);
    setHexInput(hex);
    setHexError(false);
    setTransparent(false);
    onChange(toColorString(p, p.a));
    pushColor(hex);
  };

  // --- Transparent toggle ---
  const handleTransparentToggle = () => {
    const next = !transparent;
    setTransparent(next);
    onChange(next ? 'transparent' : hsvToHex(hsv));
  };

  // --- Derived display values ---
  const currentHex = hsvToHex(hsv);
  const crosshairX = `${hsv.s * 100}%`;
  const crosshairY = `${(1 - hsv.v) * 100}%`;

  // Accordion animation
  const duration = prefersReducedMotion ? '0ms' : '200ms';
  const triggerHex = transparent ? 'transparent' : currentHex;

  // --- Input style helpers ---
  const inputBase =
    'bg-[#1a1d24] border border-panel-border text-gray-200 text-xs rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 w-full';

  return (
    <div className="flex flex-col gap-1">
      {/* Trigger row */}
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
      >
        <label className="text-xs text-gray-400 cursor-pointer select-none">{label}</label>
        <div className="flex items-center gap-2 ml-auto">
          {/* Color swatch preview */}
          <div
            className="w-6 h-5 rounded-sm border border-panel-border flex-shrink-0"
            style={{
              background: transparent
                ? CHECKERBOARD
                : triggerHex,
            }}
            aria-hidden="true"
          />
          <span className="text-xs text-gray-400 font-mono">
            {transparent ? 'transparent' : currentHex}
          </span>
          {/* Chevron */}
          <svg
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="currentColor"
            className={`text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            style={{ transitionDuration: duration }}
            aria-hidden="true"
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Accordion panel */}
      <div
        style={{
          maxHeight: isOpen ? '560px' : '0',
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          transition: `max-height ${duration} ease-out, opacity ${duration} ease-out`,
        }}
      >
        <div className="flex flex-col gap-2 pt-2">

          {/* Preset swatches */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Presets</p>
            <div className="grid grid-cols-8 gap-1">
              {PRESET_COLORS.map((color) => {
                const norm = normalizeHex(color);
                const isSelected = !transparent && currentHex.toLowerCase() === norm.toLowerCase();
                return (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Select color ${norm}`}
                    onClick={() => handleSwatchClick(norm)}
                    className={`w-6 h-6 rounded-sm cursor-pointer border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isSelected
                        ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0d0f17] border-transparent'
                        : 'border-panel-border hover:scale-110'
                    }`}
                    style={{ background: norm }}
                  />
                );
              })}
            </div>
          </div>

          {/* Recent swatches */}
          {recentColors.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Recent</p>
              <div className="grid grid-cols-8 gap-1">
                {recentColors.map((color) => {
                  const isSelected = !transparent && currentHex.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Select color ${color}`}
                      onClick={() => handleSwatchClick(color)}
                      className={`w-6 h-6 rounded-sm cursor-pointer border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        isSelected
                          ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0d0f17] border-transparent'
                          : 'border-panel-border hover:scale-110'
                      }`}
                      style={{ background: color }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-panel-border" />

          {/* Canvas + controls wrapper — dimmed when transparent */}
          <div
            className={transparent ? 'opacity-40 pointer-events-none' : ''}
          >
            {/* 2D Hue-Saturation-Brightness canvas */}
            <div className="relative w-full" style={{ height: 140 }}>
              <canvas
                ref={canvasRef}
                width={256}
                height={140}
                className="w-full h-full rounded cursor-crosshair"
                aria-label="Color saturation and brightness picker"
                tabIndex={0}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerCancel={handleCanvasPointerCancel}
                onKeyDown={handleCanvasKeyDown}
              />
              {/* Crosshair */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: crosshairX,
                  top: crosshairY,
                  transform: 'translate(-50%, -50%)',
                }}
                aria-hidden="true"
              >
                <div
                  className="w-3 h-3 rounded-full border-2 border-white shadow-md"
                  style={{ background: currentHex }}
                />
              </div>
            </div>

            {/* Hue slider */}
            <div className="mt-2">
              <label className="sr-only" htmlFor={`hue-${label}`}>Hue</label>
              <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}>
                <input
                  id={`hue-${label}`}
                  type="range"
                  min={0}
                  max={360}
                  value={hsv.h}
                  onChange={handleHueChange}
                  aria-label="Hue"
                  aria-valuenow={hsv.h}
                  aria-valuemin={0}
                  aria-valuemax={360}
                  className="absolute inset-0 w-full opacity-0 h-full cursor-pointer"
                  style={{ margin: 0 }}
                />
              </div>
              {/* Visible thumb indicator */}
              <div className="relative h-0" style={{ marginTop: -6 }} aria-hidden="true">
                <div
                  className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md pointer-events-none"
                  style={{
                    left: `calc(${(hsv.h / 360) * 100}% - 6px)`,
                    top: -6,
                    background: `hsl(${hsv.h}, 100%, 50%)`,
                  }}
                />
              </div>
            </div>

            {/* Opacity slider */}
            <div className="mt-3">
              <label className="sr-only" htmlFor={`alpha-${label}`}>Opacity</label>
              <div
                className="relative h-3 rounded-full overflow-hidden"
                style={{ background: CHECKERBOARD }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: `linear-gradient(to right, transparent, ${currentHex})` }}
                  aria-hidden="true"
                />
                <input
                  id={`alpha-${label}`}
                  type="range"
                  min={0}
                  max={100}
                  value={alpha}
                  onChange={handleAlphaChange}
                  aria-label="Opacity"
                  aria-valuenow={alpha}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="absolute inset-0 w-full opacity-0 h-full cursor-pointer"
                  style={{ margin: 0 }}
                />
              </div>
              {/* Visible thumb indicator */}
              <div className="relative h-0" style={{ marginTop: -6 }} aria-hidden="true">
                <div
                  className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md pointer-events-none"
                  style={{
                    left: `calc(${alpha}% - 6px)`,
                    top: -6,
                    background: currentHex,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-panel-border mt-1" />

          {/* Hex / RGB / HSL inputs — also dimmed when transparent */}
          <div className={transparent ? 'opacity-40 pointer-events-none' : ''}>
            {/* Hex */}
            <div className="mb-2">
              <label className="sr-only" htmlFor={`hex-${label}`}>Hex color</label>
              <input
                id={`hex-${label}`}
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                onBlur={handleHexBlur}
                maxLength={7}
                spellCheck={false}
                className={`${inputBase} font-mono ${hexError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                placeholder="#000000"
              />
            </div>

            {/* RGB */}
            <div className="flex gap-1 mb-2">
              {(['r', 'g', 'b'] as const).map((ch) => (
                <div key={ch} className="flex flex-col items-center flex-1">
                  <label className="sr-only" htmlFor={`${ch}-${label}`}>{ch.toUpperCase()}</label>
                  <input
                    id={`${ch}-${label}`}
                    type="number"
                    min={0}
                    max={255}
                    value={rgb[ch]}
                    onChange={(e) => handleRgbChange(ch, Number(e.target.value))}
                    className={`${inputBase} text-center`}
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5">{ch.toUpperCase()}</span>
                </div>
              ))}
            </div>

            {/* HSL */}
            <div className="flex gap-1">
              {(['h', 's', 'l'] as const).map((ch) => {
                const maxVal = ch === 'h' ? 360 : 100;
                return (
                  <div key={ch} className="flex flex-col items-center flex-1">
                    <label className="sr-only" htmlFor={`hsl-${ch}-${label}`}>{ch.toUpperCase()}</label>
                    <input
                      id={`hsl-${ch}-${label}`}
                      type="number"
                      min={0}
                      max={maxVal}
                      value={hsl[ch]}
                      onChange={(e) => handleHslChange(ch, Number(e.target.value))}
                      className={`${inputBase} text-center`}
                    />
                    <span className="text-[10px] text-gray-500 mt-0.5">{ch.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transparent toggle */}
          {allowTransparent && (
            <button
              type="button"
              onClick={handleTransparentToggle}
              className={`mt-1 w-full text-xs px-2 py-1 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                transparent
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                  : 'bg-transparent text-gray-400 border-panel-border hover:text-gray-200 hover:bg-panel-hover'
              }`}
            >
              Transparent
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
