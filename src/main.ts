import TimerWorker from './timer-worker?worker&inline'
import { AccountAddDialog } from './components/AccountAddDialog'
import { AccountCard } from './components/AccountCard'
import { AppHeader } from './components/AppHeader'
import { CountdownTimer } from './components/CountdownTimer'
import { getAccounts } from './data/db'
import type { TOTP } from './types'

customElements.define('account-add-dialog', AccountAddDialog)
customElements.define('account-card', AccountCard)
customElements.define('app-header', AppHeader)
customElements.define('countdown-timer', CountdownTimer)

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
