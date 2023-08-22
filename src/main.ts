import { renderList } from './account'
import TimerWorker from './timer-worker?worker'

export const timerWorker = new TimerWorker()

renderList()
