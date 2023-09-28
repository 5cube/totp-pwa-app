import { DEFAULT_PERIOD, DEFAULT_DIGITS } from '../data/const'
import { timerWorker } from '../main'
import { getAccount } from '../data/db'
import { secondsFromMs, periodSeconds } from '../utils/seconds'
import init, { get_token } from '../../wasm/pkg/totp_wasm'

export class AccountCode extends HTMLElement {
  private seconds: number | null = null
  private period = DEFAULT_PERIOD

  constructor() {
    super()

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
      ?.querySelector('countdown-timer')
      ?.setAttribute('seconds', String(this.seconds))
  }

  private setPeriod(val: string | number | null) {
    if (!val) {
      return
    }
    this.period = Number.parseInt(val as string) || DEFAULT_PERIOD
    timerWorker.postMessage({ type: 'period', period: this.period })
    this.shadowRoot
      ?.querySelector('countdown-timer')
      ?.setAttribute('period', String(this.period))
  }

  private async setCode() {
    const accountId = this.getAttribute('account-id') as string
    const item = await getAccount(accountId)
    if (item) {
      const code = get_token(
        item.secret,
        BigInt(this.period),
        item.digits ?? DEFAULT_DIGITS,
      )
      const element =
        this.shadowRoot?.querySelector<HTMLElement>('[part="code"]>span')
      if (element) {
        element.innerText = code || '-'
      }
    }
  }

  static get observedAttributes() {
    return ['period']
  }

  async connectedCallback() {
    await init()

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

    this.setPeriod(this.getAttribute('period'))
    const seconds = periodSeconds(secondsFromMs(Date.now()), this.period)
    this.setSeconds(seconds)
    this.setCode()

    timerWorker.addEventListener('message', (e) => {
      switch (e.data.type) {
        case 'tick':
          const seconds = e.data[this.period]
          this.setSeconds(seconds)
          if (seconds === this.period) {
            this.setCode()
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
