import { getAccounts, deleteAccount } from './db.ts'
import { timerWorker } from './main.ts'
import type { TOTP } from './types.ts'

const DEFAULT_PERIOD = 30

const listSection = document.getElementById('accounts-list') as HTMLElement

function getRandom() {
  return (Math.random() + 1).toString(36).substring(6)
}

class CountdownTimer extends HTMLElement {
  private rendered = false

  private getColors(value: number) {
    return `hsl(${value * 120},100%,40%)`
  }

  private render() {
    const value = Number(this.getAttribute('seconds'))
    const period =
      Number.parseInt(this.getAttribute('period') as string) || DEFAULT_PERIOD
    const color = this.getColors(value / period)
    this.innerHTML = `
      <div class="relative transition-colors" style="color: ${color};">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" class="-rotate-90">
          <circle r="20" cx="24" cy="24" fill="none" stroke="${color}" stroke-width="2px"></circle>
        </svg>
        <div class="text-current font-bold absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">${value}</div>
      </div>
    `
  }

  static get observedAttributes() {
    return ['seconds', 'period']
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render()
      this.rendered = true
    }
  }

  attributeChangedCallback() {
    this.render()
  }
}

customElements.define('countdown-timer', CountdownTimer)

class AccountCard extends HTMLElement {
  private code = ''
  private label = ''
  private seconds = 0
  private period = DEFAULT_PERIOD

  constructor() {
    super()
    this.code = getRandom()
    this.label = this.getAttribute('label') as string
    this.setPeriod(this.getAttribute('period'))
    timerWorker.addEventListener('message', (e) => {
      const seconds = e.data[this.period]
      ;(this.querySelector('countdown-timer') as HTMLElement)?.setAttribute(
        'seconds',
        seconds,
      )
      if (seconds === this.period) {
        this.code = getRandom()
        const element = this.querySelector('.code')
        if (element) {
          element.innerHTML = this.code
        }
      }
    })
  }

  private setPeriod(val: string | number | null) {
    if (!val) {
      return
    }
    this.period = Number.parseInt(val as string) || DEFAULT_PERIOD
    timerWorker.postMessage({ period: this.period })
    ;(this.querySelector('countdown-timer') as HTMLElement)?.setAttribute(
      'period',
      String(this.period),
    )
  }

  static get observedAttributes() {
    return ['label', 'period']
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="py-2 px-4 rounded-lg shadow flex items-center space-x-2">
        <div class="grow flex flex-col space-y-1">
          <label>
            ${this.label}
          </label>
          <div class="flex">
            <div class="code py-1.5 px-3 font-semibold flex items-center justify-center rounded-lg bg-gray-100 tracking-widest cursor-pointer">
              ${this.code}
            </div>
          </div>
        </div>
        <div>
          <countdown-timer seconds="${this.seconds}" period="${this.period}"></countdown-timer>
        </div>
        <button class="shrink-0 hover:text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    `
    ;(this.querySelector('button') as HTMLButtonElement).onclick = async () => {
      const result = confirm('Вы уверены что хотите удалить?')
      if (result) {
        await deleteAccount(this.label)
        await renderList()
      }
    }
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | number | null,
    newValue: string | number | null,
  ) {
    switch (name) {
      case 'label':
        this.label = newValue as string
        const element = this.querySelector('label')
        if (element) {
          element.innerHTML = this.label
        }
        break
      case 'period':
        this.setPeriod(newValue)
        break
    }
  }
}

customElements.define('account-card', AccountCard)

export async function renderList() {
  const items = await getAccounts()
  listSection.innerHTML = items
    .map((item) => {
      return `
      <account-card label="${item.label}" period="${
        (item as TOTP).period
      }"></account-card>
    `
    })
    .join('')
}
