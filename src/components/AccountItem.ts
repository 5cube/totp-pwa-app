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
    return ['account-id', 'period']
  }

  connectedCallback() {
    this.shadowRoot
      ?.querySelector('button')
      ?.addEventListener('click', async () => {
        const accountId = this.getAttribute('account-id') as string
        const result = confirm('Вы уверены что хотите удалить?')
        if (result) {
          await AccountList.deleteItem(accountId)
          history.length > 2 ? history.back() : location.replace('/')
        }
      })
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | number | null,
    newValue: string | number | null,
  ) {
    switch (name) {
      case 'account-id':
        if (newValue) {
          this.shadowRoot
            ?.querySelector<HTMLElement>('account-code')
            ?.setAttribute('account-id', newValue as string)
        }
        break
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
