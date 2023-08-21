import { getAccounts, deleteAccount } from './db.ts'

const listSection = document.getElementById('accounts-list') as HTMLElement

const PERIOD_IN_SECONDS = 30

let seconds = Math.floor(
  (new Date().getTime() % (PERIOD_IN_SECONDS * 1000)) / 1000,
)

calcSeconds(seconds)

setInterval(() => {
  const val = ++seconds
  if (val < 2) {
    renderList()
  }
  calcSeconds(val)
}, 1000)

function calcSeconds(val: number) {
  seconds = val >= PERIOD_IN_SECONDS ? 0 : val

  const items = document.querySelectorAll('countdown-timer')
  for (const item of items) {
    item.setAttribute('seconds', String(PERIOD_IN_SECONDS - seconds))
  }
}

function getRandom() {
  return (Math.random() + 1).toString(36).substring(6)
}

class CountdownTimer extends HTMLElement {
  rendered = false

  getColors(value: number) {
    return `hsl(${value * 120},100%,40%)`
  }

  render() {
    const value = Number(this.getAttribute('seconds'))
    const color = this.getColors(value / PERIOD_IN_SECONDS)
    this.innerHTML = `
      <div class="relative transition-colors" style="color: ${color};">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" class="-rotate-90">
          <circle r="20" cx="24" cy="24" fill="none" stroke="${color}" stroke-width="2px"></circle>
        </svg>
        <div class="text-current font-bold absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">${value}</div>
      </div>
    `
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render()
      this.rendered = true
    }
  }

  static get observedAttributes() {
    return ['seconds']
  }

  attributeChangedCallback() {
    this.render()
  }
}

customElements.define('countdown-timer', CountdownTimer)

class AccountCard extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label') as string
    this.innerHTML = `
      <div class="py-2 px-4 rounded-lg shadow flex items-center space-x-2">
        <div class="grow flex flex-col space-y-1">
          <div>
            ${label}
          </div>
          <div class="flex">
            <div class="py-1.5 px-3 font-semibold flex items-center justify-center rounded-lg bg-gray-100 tracking-widest cursor-pointer">
              ${getRandom()}
            </div>
          </div>
        </div>
        <div>
          <countdown-timer></countdown-timer>
        </div>
        <button class="shrink-0 hover:text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    `

    const button = this.querySelector('button') as HTMLButtonElement
    button.onclick = async () => {
      const result = confirm('Вы уверены что хотите удалить?')
      if (result) {
        await deleteAccount(label)
        await renderList()
      }
    }
  }
}

customElements.define('account-card', AccountCard)

export async function renderList() {
  const items = await getAccounts()
  listSection.innerHTML = items
    .map((item) => {
      return `
      <account-card label="${item.label}"></account-card>
    `
    })
    .join('')
}
