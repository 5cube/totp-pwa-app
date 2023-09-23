import { AccountList } from './AccountList'
import type { AccountCreateRequest } from '../types'

export class AccountAddDialog extends HTMLElement {
  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const template = document.getElementById(
      'account-add-dialog-template',
    ) as HTMLTemplateElement
    shadowRoot.appendChild(template.content.cloneNode(true))
  }

  private openAddDialog() {
    const addButton = this.shadowRoot?.getElementById(
      'add-button',
    ) as HTMLButtonElement
    const addDialog = this.shadowRoot?.getElementById(
      'add-dialog',
    ) as HTMLDialogElement
    addButton.setAttribute('aria-expanded', 'true')
    addButton.setAttribute('aria-controls', 'add-dialog')
    addDialog.showModal()
  }

  private closeAddDialog() {
    const addButton = this.shadowRoot?.getElementById(
      'add-button',
    ) as HTMLButtonElement
    addButton.removeAttribute('aria-expanded')
    addButton.removeAttribute('aria-controls')
  }

  connectedCallback() {
    const addButton = this.shadowRoot?.getElementById(
      'add-button',
    ) as HTMLButtonElement
    const addDialog = this.shadowRoot?.getElementById(
      'add-dialog',
    ) as HTMLDialogElement
    const addForm = this.shadowRoot?.getElementById(
      'add-form',
    ) as HTMLFormElement
    const addFormCancelButton = this.shadowRoot?.getElementById(
      'add-form-cancel',
    ) as HTMLButtonElement

    addButton.addEventListener('click', () => {
      this.openAddDialog()
    })

    addDialog.addEventListener('close', async () => {
      if (addDialog.returnValue === 'submit') {
        const formData = new FormData(addForm)
        const data: AccountCreateRequest = {
          label: encodeURIComponent(formData.get('add-form-label') as string),
          secret: formData.get('add-form-secret') as string,
          type: 'totp',
        }
        addForm.reset()
        await AccountList.addItem(data)
      }
      this.closeAddDialog()
    })

    addFormCancelButton.addEventListener('click', (e) => {
      e.preventDefault()
      addDialog.close(addFormCancelButton.value)
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'account-add-dialog': AccountAddDialog
  }
}
