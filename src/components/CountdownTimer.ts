import { DEFAULT_PERIOD } from '../data/const'

export class CountdownTimer extends HTMLElement {
  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const template = document.getElementById(
      'countdown-timer-template',
    ) as HTMLTemplateElement
    shadowRoot.appendChild(template.content.cloneNode(true))
  }

  private getColors(value: number) {
    return `hsl(${value * 120},100%,40%)`
  }

  private setColor() {
    const seconds = this.getAttribute('seconds')
    const value = seconds ? Number.parseInt(seconds) : null
    const period =
      Number.parseInt(this.getAttribute('period') as string) || DEFAULT_PERIOD
    const rootElement =
      this.shadowRoot?.querySelector<HTMLElement>('div:first-of-type')
    const valueElement = rootElement?.querySelector(
      '[part="value"]',
    ) as HTMLElement
    if (value) {
      rootElement?.style.setProperty('color', this.getColors(value / period))
      valueElement.innerText = String(value)
    } else {
      rootElement?.style.removeProperty('color')
      valueElement.innerText = ''
    }
  }

  static get observedAttributes() {
    return ['seconds', 'period']
  }

  connectedCallback() {
    this.setColor()
  }

  attributeChangedCallback(
    _name: string,
    oldValue: string | number | null,
    newValue: string | number | null,
  ) {
    if (oldValue !== newValue) {
      this.setColor()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'countdown-timer': CountdownTimer
  }
}
