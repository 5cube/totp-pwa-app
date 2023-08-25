import TimerWorker from './timer-worker?worker&inline'
import { AccountCard } from './components/AccountCard'
import { CountdownTimer } from './components/CountdownTimer'
import { getAccounts } from './data/db'
import type { TOTP } from './types'

customElements.define('countdown-timer', CountdownTimer)
customElements.define('account-card', AccountCard)

export const timerWorker = new TimerWorker()

async function renderList() {
  const items = await getAccounts()
  ;(document.getElementById('accounts-list') as HTMLElement).innerHTML = items
    .map((item) => {
      return `
      <account-card id="${item.id}" label="${item.label}" period="${
        (item as TOTP).period
      }"></account-card>
    `
    })
    .join('')
}

renderList()
