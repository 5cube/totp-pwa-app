import { DEFAULT_PERIOD } from './data/const'
import { secondsFromMs, periodSeconds } from './utils/seconds'

// секунды расшареннего таймера
let seconds = secondsFromMs(Date.now())
// периоды могут расширяться
const periods = [DEFAULT_PERIOD]

postSeconds(seconds)

// тик таймера
setInterval(() => {
  postSeconds(++seconds)
}, 1000)

// отправка тика таймера с вычисленными периодами
function postSeconds(s: number) {
  const periodSeconds = calcPeriodsSeconds(s)
  self.postMessage({
    type: 'tick',
    ...periodSeconds,
  })
}

// вычисление секунд с периодами
function calcPeriodsSeconds(s: number) {
  return periods.reduce(
    (acc, period) => {
      acc[period] = periodSeconds(s, period)
      return acc
    },
    {} as Record<string, number>,
  )
}

self.onmessage = (e) => {
  switch (e.data.type) {
    // расширение периодов
    case 'period':
      const period = e.data.period
      if (period && Number.isInteger(period) && !periods.includes(period)) {
        periods.push(period)
      }
      break
  }
}
