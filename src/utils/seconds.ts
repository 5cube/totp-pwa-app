import { DEFAULT_PERIOD } from '../data/const'

/**
 * миллисекунды в секунды
 *
 * @param ms - миллисекунды
 * @returns секунды
 */
export function secondsFromMs(ms: number) {
  return Math.floor(ms / 1000)
}

/**
 * секунды в рамках указанного периода
 *
 * @param seconds - секунды
 * @param period - период в секундах
 * @returns секунды
 */
export function periodSeconds(seconds: number, period = DEFAULT_PERIOD) {
  return period - (seconds % period)
}
