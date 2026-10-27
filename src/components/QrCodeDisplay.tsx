/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';

interface QrCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
  className?: string;
}

/**
 * Deterministic, lightweight 25x25 SVG QR-style matrix generator.
 * Zero external libraries needed, scales crisply at any DPI, perfectly accessible.
 */
export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  value,
  size = 180,
  label = 'QR Verification Code',
  className = '',
}) => {
  const matrix = useMemo(() => {
    const dim = 25;
    const grid: boolean[][] = Array.from({ length: dim }, () => Array(dim).fill(false));

    // Simple hash function for deterministic pattern based on input string
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    // Function to draw standard corner position detection squares (7x7)
    const drawFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[startY + r][startX + c] = isBorder || isCenter;
        }
      }
    };

    drawFinder(0, 0); // Top-left
    drawFinder(dim - 7, 0); // Top-right
    drawFinder(0, dim - 7); // Bottom-left

    // Timing lines
    for (let i = 8; i < dim - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Fill data area deterministically
    let bitIndex = 0;
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        // Skip corner finder zones
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= dim - 8) ||
          (r >= dim - 8 && c < 8) ||
          r === 6 ||
          c === 6
        ) {
          continue;
        }
        const pseudoRandom = Math.abs(Math.sin(hash + bitIndex * 13 + r * 17 + c * 31));
        grid[r][c] = pseudoRandom > 0.45;
        bitIndex++;
      }
    }

    return grid;
  }, [value]);

  const dim = matrix.length;
  const cellSize = size / dim;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm inline-block"
        role="img"
        aria-label={`${label}: ${value}`}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rounded-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width={size} height={size} fill="#ffffff" />
          {matrix.map((row, r) =>
            row.map((filled, c) =>
              filled ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize + 0.3}
                  height={cellSize + 0.3}
                  fill="#0f172a"
                />
              ) : null
            )
          )}
        </svg>
      </div>
      <p className="text-[11px] text-slate-500 font-mono tracking-wider truncate max-w-[220px]">
        {value}
      </p>
    </div>
  );
};
