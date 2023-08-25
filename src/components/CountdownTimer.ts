import { DEFAULT_PERIOD } from '../data/const'

export class CountdownTimer extends HTMLElement {
  private rendered = false

  private getColors(value: number) {
    return `hsl(${value * 120},100%,40%)`
  }

  private render() {
    const seconds = this.getAttribute('seconds')
    const value = seconds ? Number.parseInt(seconds) : null
    const period =
      Number.parseInt(this.getAttribute('period') as string) || DEFAULT_PERIOD
    if (value) {
      const color = this.getColors(value / period)
      this.innerHTML = `
      <div class="relative transition-colors" style="color: ${color};">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" class="-rotate-90">
          <circle r="20" cx="24" cy="24" fill="none" stroke="${color}" stroke-width="2px"></circle>
        </svg>
        <div class="text-current font-bold absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">${value}</div>
      </div>
    `
    } else {
      this.innerHTML = ''
    }
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
