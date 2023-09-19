import { DEFAULT_PERIOD } from '../data/const'
import { deleteAccount } from '../data/db'
import { timerWorker } from '../main'

function getRandom() {
  return (Math.random() + 1).toString(36).slice(2, 8)
}

function deleteAccountCard(id: string) {
  document.getElementById(id)?.remove()
}

export class AccountCard extends HTMLElement {
  private code = ''
  private label = ''
  private seconds: number | null = null
  private period = DEFAULT_PERIOD

  constructor() {
    super()

    this.code = getRandom()
    this.label = this.getAttribute('label') as string

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const template = document.getElementById(
      'account-card-template',
    ) as HTMLTemplateElement
    shadowRoot.appendChild(template.content.cloneNode(true))
    ;(shadowRoot.querySelector('button') as HTMLButtonElement).onclick =
      async () => {
        const result = confirm('Вы уверены что хотите удалить?')
        if (result) {
          await deleteAccount(this.id)
          deleteAccountCard(this.id)
        }
      }

    this.setLabel(this.label)
    this.setCode(this.code)
    this.setPeriod(this.getAttribute('period'))
    // получить секунды по id немедленно
    timerWorker.postMessage({
      type: 'seconds',
      id: this.id,
      period: this.period,
    })
    timerWorker.addEventListener('message', (e) => {
      switch (e.data.type) {
        case 'tick':
          const seconds = e.data[this.period]
          this.setSeconds(seconds)
          if (seconds === this.period) {
            this.code = getRandom()
            this.setCode(this.code)
          }
          break
        case 'seconds':
          this.setSeconds(e.data.seconds)
          break
      }
    })
  }

  private setSeconds(val: number | null) {
    if (!val) {
      return
    }
    this.seconds = val
    ;(
      this.shadowRoot?.querySelector('countdown-timer') as HTMLElement
    )?.setAttribute('seconds', String(this.seconds))
  }

  private setPeriod(val: string | number | null) {
    if (!val) {
      return
    }
    this.period = Number.parseInt(val as string) || DEFAULT_PERIOD
    timerWorker.postMessage({ type: 'period', period: this.period })
    ;(
      this.shadowRoot?.querySelector('countdown-timer') as HTMLElement
    )?.setAttribute('period', String(this.period))
  }

  private setCode(code: string) {
    const element = this.shadowRoot?.querySelector('.code')
    if (element) {
      element.innerHTML = code
    }
  }

  private setLabel(label: string) {
    const element = this.shadowRoot?.querySelector('label')
    if (element) {
      element.innerHTML = label
    }
  }

  static get observedAttributes() {
    return ['label', 'period']
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | number | null,
    newValue: string | number | null,
  ) {
    switch (name) {
      case 'label':
        this.label = newValue as string
        this.setLabel(this.label)
        break
      case 'period':
        this.setPeriod(newValue)
        break
    }
  }
}
