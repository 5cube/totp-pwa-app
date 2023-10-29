<template>
  <div part="code" role="button">
    <span></span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
      />
    </svg>
  </div>
  <countdown-timer></countdown-timer>
</template>

<script lang="ts">
import { DEFAULT_PERIOD, DEFAULT_DIGITS } from '../data/const'
import { timerWorker } from '../main'
import { getAccount } from '../data/db'
import { secondsFromMs, periodSeconds } from '../utils/seconds'
import init, { get_token } from '../../wasm/pkg/totp_wasm'

export default class AccountCode extends HTMLElement {
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
</script>

<style>
:host {
  position: relative;
  display: flex;
  align-items: center;
}
[part='code'] {
  font-size: 1.875rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  background-color: rgb(var(--colors-gray-light) / 0.15);
}
[part='code']:hover {
  background-color: rgb(var(--colors-gray-light) / 0.3);
}
@media (prefers-color-scheme: dark) {
  [part='code'] {
    background-color: rgb(var(--colors-gray-dark) / 0.15);
  }
  [part='code']:hover {
    background-color: rgb(var(--colors-gray-dark) / 0.3);
  }
}
:host([card]) [part='code'] {
  font-size: 1.25rem;
  padding: 0;
  border-radius: 0;
  background-color: transparent;
}
[part='code'] svg {
  width: 0.8em;
  height: 0.8em;
  color: rgb(var(--colors-gray));
}
[part='code']:hover svg {
  color: rgb(var(--colors-text));
}
countdown-timer {
  margin-left: 0.5rem;
}
:host([card]) countdown-timer {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
