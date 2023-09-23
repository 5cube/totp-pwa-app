import { DEFAULT_PERIOD } from '../data/const'
import { timerWorker } from '../main'
import { secondsFromMs, periodSeconds } from '../utils/seconds'

function getRandom() {
  return (Math.random() + 1).toString(36).slice(2, 8)
}

export class AccountCode extends HTMLElement {
  private code = ''
  private seconds: number | null = null
  private period = DEFAULT_PERIOD

  constructor() {
    super()

    this.code = getRandom()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const template = document.getElementById(
      'account-code-template',
    ) as HTMLTemplateElement
    shadowRoot.appendChild(template.content.cloneNode(true))
  }

  private setSeconds(val: number | null) {
    if (!val) {
      return
    }
    this.seconds = val
    this.shadowRoot
      ?.querySelector<HTMLElement>('countdown-timer')
      ?.setAttribute('seconds', String(this.seconds))
  }

  private setPeriod(val: string | number | null) {
    if (!val) {
      return
    }
    this.period = Number.parseInt(val as string) || DEFAULT_PERIOD
    timerWorker.postMessage({ type: 'period', period: this.period })
    this.shadowRoot
      ?.querySelector<HTMLElement>('countdown-timer')
      ?.setAttribute('period', String(this.period))
  }

  private setCode(code: string) {
    const element =
      this.shadowRoot?.querySelector<HTMLElement>('[part="code"]>span')
    if (element) {
      element.innerText = code
    }
  }

  static get observedAttributes() {
    return ['period']
  }

  connectedCallback() {
    const codeElement = this.shadowRoot?.querySelector<HTMLElement>('span')

    this.shadowRoot
      ?.querySelector('[role="button"]')
      ?.addEventListener('click', (e) => {
        e.stopPropagation()
        const text = codeElement?.innerText
        if (text) {
          navigator.clipboard.writeText(text)
          console.log('Скопировано!', codeElement.innerText)
        }
      })

    this.setCode(this.code)
    this.setPeriod(this.getAttribute('period'))
    const seconds = periodSeconds(secondsFromMs(Date.now()), this.period)
    this.setSeconds(seconds)

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
      }
    })
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ) {
    switch (name) {
      case 'period':
        this.setPeriod(newValue)
        break
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'account-code': AccountCode
  }
}
