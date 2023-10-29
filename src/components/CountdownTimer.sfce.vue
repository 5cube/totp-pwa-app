<template>
  <div>
    <svg
      part="svg"
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 48 48"
    >
      <circle
        r="20"
        cx="24"
        cy="24"
        fill="none"
        stroke="currentColor"
        stroke-width="2px"
      ></circle>
    </svg>
    <span part="value"></span>
  </div>
</template>

<script lang="ts">
import { DEFAULT_PERIOD } from '../data/const'

export default class CountdownTimer extends HTMLElement {
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
</script>

<style>
:host {
  width: 3rem;
  height: 3rem;
  position: relative;
}
:host > div:first-of-type {
  color: rgb(var(--colors-gray-light) / 0.5);
  transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
@media (prefers-color-scheme: dark) {
  :host > div:first-of-type {
    color: rgb(var(--colors-gray-dark) / 0.5);
  }
}
[part='svg'] {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
  display: block;
}
[part='value'] {
  color: currentColor;
  font-size: 1rem;
  font-weight: 700;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
