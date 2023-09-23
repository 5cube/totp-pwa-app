import { getAccounts, addAccount, deleteAccount } from '../data/db'
import { AccountCard } from './AccountCard'
import type { AccountCreateRequest } from '../types'

export class AccountList extends HTMLElement {
  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const template = document.getElementById(
      'account-list-template',
    ) as HTMLTemplateElement
    shadowRoot.appendChild(template.content.cloneNode(true))

    // устанавливется атрибут загрузки
    const sectionElement = shadowRoot.querySelector('section')
    sectionElement?.setAttribute('loading', '')
  }

  async connectedCallback() {
    const items = await getAccounts()
    const sectionElement = this.shadowRoot?.querySelector('section')
    if (sectionElement) {
      // после получения данных атрибут загрузки удаляется
      sectionElement.removeAttribute('loading')
      for (const item of items) {
        const itemElement = AccountCard.createElement(item)
        sectionElement.appendChild(itemElement)
      }
    }
  }

  static async addItem(data: AccountCreateRequest) {
    const item = await addAccount(data)
    const itemElement = AccountCard.createElement(item)
    document
      .querySelector('account-list')
      ?.shadowRoot?.querySelector('section')
      ?.prepend(itemElement)

    // заменить hash, если имеется
    if (location.hash) {
      location.replace(`#${item.id}`)
    }
  }

  static async deleteItem(id: string) {
    await deleteAccount(id)
    document
      .querySelector('account-list')
      ?.shadowRoot?.querySelector(`[account-id="${id}"]`)
      ?.remove()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'account-list': AccountList
  }
}
