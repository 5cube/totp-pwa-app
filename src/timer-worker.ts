let seconds = secondsFromMs(Date.now())
const periods = [30]

postSeconds(seconds)

setInterval(() => {
  postSeconds(++seconds)
}, 1000)

function postSeconds(s: number) {
  const periodSeconds = calcPeriodsSeconds(s)
  self.postMessage({
    seconds: s,
    ...periodSeconds,
  })
}

function secondsFromMs(ms: number) {
  return Math.floor(ms / 1000)
}

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
  const period = e.data.period
  if (period && Number.isInteger(period) && !periods.includes(period)) {
    periods.push(period)
  }
}
