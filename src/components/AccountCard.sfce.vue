<template>
  <div>
    <div>
      <account-code card></account-code>
    </div>
    <label>
      <slot name="label"></slot>
    </label>
  </div>
  <button
    part="button button-flat button-icon button-delete"
    aria-label="Удалить"
  >
    <svg
      part="icon"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  </button>
</template>

<script lang="ts">
import { DEFAULT_PERIOD } from '../data/const'
import AccountList from './AccountList.sfce.vue'
import type { Account } from '../types'

export default class AccountCard extends HTMLElement {
  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const template = document.getElementById(
      'account-card-template',
    ) as HTMLTemplateElement
    shadowRoot.appendChild(template.content.cloneNode(true))
  }

  private setLabel(label: string) {
    const element = this.shadowRoot?.querySelector('label')
    if (element) {
      element.innerHTML = decodeURIComponent(label)
    }
  }

  static get observedAttributes() {
    return ['label', 'period']
  }

  connectedCallback() {
    const accountId = this.getAttribute('account-id') as string

    this.shadowRoot
      ?.querySelector('account-code')
      ?.setAttribute('account-id', accountId)

    this.shadowRoot
      ?.querySelector('button')
      ?.addEventListener('click', async (e) => {
        e.stopPropagation()
        const result = confirm('Вы уверены что хотите удалить?')
        if (result) {
          await AccountList.deleteItem(accountId)
        }
      })

    this.shadowRoot?.addEventListener('click', () => {
      location.assign(`#${accountId}`)
    })
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | number | null,
    newValue: string | number | null,
  ) {
    switch (name) {
      case 'label':
        if (newValue) {
          this.setLabel(newValue as string)
        }
        break
      case 'period':
        this.shadowRoot
          ?.querySelector('account-code')
          ?.setAttribute('period', String(newValue || DEFAULT_PERIOD))
        break
    }
  }

  static createElement(item: Account) {
    const element = document.createElement('account-card')
    const period = item.period
    element.setAttribute('account-id', String(item.id))
    element.setAttribute('label', item.label)
    if (period) {
      element.setAttribute('period', String(period))
    }
    return element
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'account-card': AccountCard
  }
}
</script>

<style>
:host {
  display: flex;
  align-items: center;
  border-radius: 0.5rem;
  padding: 1rem;
  padding-top: 0.75rem;
  padding-right: 0.5rem;
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 0.1),
    0 1px 2px -1px rgb(0 0 0 / 0.1);
}
:host > div:first-of-type {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
label {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
@media (prefers-color-scheme: dark) {
  :host {
    box-shadow: none;
    background-color: rgb(var(--colors-gray-dark) / 0.25);
  }
}
</style>
