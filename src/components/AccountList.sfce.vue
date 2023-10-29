<script lang="ts">
import { getAccounts, addAccount, deleteAccount } from '../data/db'
import AccountCard from './AccountCard.sfce.vue'
import type { AccountCreateRequest } from '../types'

export default class AccountList extends HTMLElement {
  constructor() {
    super()
  }

  async connectedCallback() {
    const items = await getAccounts()
    const sectionElement = document.querySelector('account-list section')
    if (sectionElement) {
      // удаляется атрибут индикации загрузки, который установлен в шаблоне html
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
    document.querySelector('account-list section')?.prepend(itemElement)

    // заменить hash, если имеется
    if (location.hash) {
      location.replace(`#${item.id}`)
    }
  }

  static async deleteItem(id: string) {
    await deleteAccount(id)
    document.querySelector(`account-list [account-id="${id}"]`)?.remove()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'account-list': AccountList
  }
}
</script>
