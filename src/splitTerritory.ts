import paper from "paper";

/**
 * Splits an SVG path into two halves depending on its orientation.
 *  - If taller than wide → splits horizontally (angle 0°)
 *  - If wider than tall → splits vertically (angle 90°)
 *
 * Returns two SVG path strings (d attributes) for the resulting shapes.
 */
export function splitSvgPathAuto(pathD: string): {
  partA: string;
  partB: string;
  angleUsed: number;
} {
  // Create offscreen Paper.js environment
  const canvas = document.createElement("canvas");
  const scope = new paper.PaperScope();
  scope.setup(canvas);

  const { Path, Point, Size } = scope;

  // Wrap the path for import
  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg">
    <path d="${pathD.replace(/"/g, "&quot;")}" fill="none" stroke="black"/>
  </svg>`;

  // Import into Paper.js
  const imported = scope.project.importSVG(svgMarkup, {
    expandShapes: true,
    insert: true,
  });

  const item = imported.getItems({
    recursive: true,
    match: (el: any) => el instanceof Path || el instanceof scope.CompoundPath,
  })[0] as paper.PathItem | undefined;

  if (!item) {
    scope.project.clear();
    throw new Error("Failed to parse SVG path `d`.");
  }

  // Ensure closed path for boolean ops
  if (item instanceof Path && !item.closed) item.closed = true;

  // Orientation: taller → horizontal split (0°), wider → vertical split (90°)
  const { width, height, center } = item.bounds;
  const primaryAngle = height > width ? 0 : 90;

  // Build two huge half-plane rectangles along the chosen split
  function makeHalfPlanes(angleDeg: number) {
    const size = 1_000_000; // effectively infinite
    const bigSize = new Size(size, size);
    const angleRad = (angleDeg * Math.PI) / 180;

    // unit normal to the split line
    const nx = Math.cos(angleRad + Math.PI / 2);
    const ny = Math.sin(angleRad + Math.PI / 2);
    const normal = new Point(nx, ny);

    // Position each huge rectangle so that its NEAR edge lies exactly on the center line.
    // That means offset by ±(size/2) along the normal.
    const rectA = new Path.Rectangle(new Point(-size / 2, -size / 2), bigSize);
    rectA.rotate(angleDeg, new Point(0, 0));
    rectA.position = center.add(normal.multiply(size / 2)); // <-- changed from size/4

    const rectB = new Path.Rectangle(new Point(-size / 2, -size / 2), bigSize);
    rectB.rotate(angleDeg, new Point(0, 0));
    rectB.position = center.subtract(normal.multiply(size / 2)); // <-- changed from size/4

    return { rectA, rectB };
  }

  // Helper to export a Paper.js shape back to an SVG path string
  function exportD(shape: paper.Item) {
    const node = shape.exportSVG({
      asString: false,
      precision: 3,
    }) as SVGPathElement;
    return node.getAttribute("d") || "";
  }

  // Try to split at the given angle
  function trySplit(angleDeg: number) {
    const { rectA, rectB } = makeHalfPlanes(angleDeg);
    let partA: paper.Item | null = null;
    let partB: paper.Item | null = null;

    if (!item) {
      throw new Error("Item to split is undefined.");
    }

    try {
      partA = item.intersect(rectA, { insert: false });
    } catch {
      partA = null;
    }
    try {
      partB = item.intersect(rectB, { insert: false });
    } catch {
      partB = null;
    }

    rectA.remove();
    rectB.remove();

    const ok =
      partA &&
      partB &&
      "area" in partA &&
      "area" in partB &&
      (partA as any).area > 1 &&
      (partB as any).area > 1;

    return ok ? { dA: exportD(partA!), dB: exportD(partB!) } : null;
  }

  // Try the orientation-based angle; fallback with 90° rotation if needed
  let attempt = trySplit(primaryAngle);
  let usedAngle = primaryAngle;
  if (!attempt) {
    const fallbackAngle = (primaryAngle + 90) % 180;
    const fallback = trySplit(fallbackAngle);
    if (!fallback) {
      scope.project.clear();
      throw new Error("Split failed or produced degenerate parts.");
    }
    attempt = fallback;
    usedAngle = fallbackAngle;
  }

  scope.project.clear();
  return { partA: attempt.dA, partB: attempt.dB, angleUsed: usedAngle };
}
