/**
 * return a value that has been rounded to a set precision
 * @param value the value to round
 * @param precision the precision (decimal places), default: 3
 * @returns rounded number
 */
export const round = (value: number, precision: number = 3): number =>
  parseFloat(value.toFixed(precision));

/**
 * return a value that has been limited between min & max
 * @param value the value to clamp
 * @param min minimum value to allow, default: 0
 * @param max maximum value to allow, default: 100
 * @returns clamped number
 */
export const clamp = (value: number, min: number = 0, max: number = 100): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * return a value that has been re-mapped according to the from/to
 * - for example, adjust(10, 0, 100, 100, 0) = 90
 * @param value the value to re-map (or adjust)
 * @param fromMin min value to re-map from
 * @param fromMax max value to re-map from
 * @param toMin min value to re-map to
 * @param toMax max value to re-map to
 * @returns adjusted number
 */
export const adjust = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number => {
  return round(toMin + (toMax - toMin) * (value - fromMin) / (fromMax - fromMin));
};
