import { DEFAULT_PERIOD } from '../data/const'
import { AccountList } from './AccountList'

export class AccountItem extends HTMLElement {
  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const template = document.getElementById(
      'account-item-template',
    ) as HTMLTemplateElement
    shadowRoot.appendChild(template.content.cloneNode(true))
  }

  static get observedAttributes() {
    return ['period']
  }

  connectedCallback() {
    const accountId = this.getAttribute('account-id') as string

    this.shadowRoot
      ?.querySelector('button')
      ?.addEventListener('click', async () => {
        const result = confirm('Вы уверены что хотите удалить?')
        if (result) {
          await AccountList.deleteItem(accountId)
          history.length > 2 ? history.back() : location.replace('/')
        }
      })

    this.shadowRoot
      ?.querySelector<HTMLElement>('account-code')
      ?.setAttribute('account-id', accountId)
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | number | null,
    newValue: string | number | null,
  ) {
    switch (name) {
      case 'period':
        this.shadowRoot
          ?.querySelector<HTMLElement>('account-code')
          ?.setAttribute('period', String(newValue || DEFAULT_PERIOD))
        break
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'account-item': AccountItem
  }
}
