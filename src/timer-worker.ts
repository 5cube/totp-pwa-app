// период по умолчанию 30 секунд
const DEFAULT_PERIOD = 30
// расшаренный таймер
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

// милисекунды в секунды
function secondsFromMs(ms: number) {
  return Math.floor(ms / 1000)
}

// вычисление секунды относительно установленных периодов
function calcPeriodsSeconds(s: number) {
  return periods.reduce(
    (acc, period) => {
      acc[period] = period - (s % period)
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
    // немедленно вернуть секунды
    case 'seconds':
      const id = e.data.id
      if (id) {
        const period = e.data.period || DEFAULT_PERIOD
        const periodSeconds = calcPeriodsSeconds(seconds)[period]
        if (periodSeconds && Number.isInteger(periodSeconds)) {
          self.postMessage({
            type: 'seconds',
            id,
            seconds: periodSeconds,
          })
        }
      }
  }
}
