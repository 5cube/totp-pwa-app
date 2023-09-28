import { DEFAULT_PERIOD } from '../data/const'
import { AccountList } from './AccountList'
import type { Account } from '../types'

export class AccountCard extends HTMLElement {
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
      element.innerHTML = label
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
