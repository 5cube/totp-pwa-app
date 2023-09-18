import { addAccount } from '../data/db'
import type { Account, AccountCreateRequest, TOTP } from '../types'

export class AccountAddDialog extends HTMLElement {
  private addButton: HTMLButtonElement | undefined
  private addDialog: HTMLDialogElement | undefined

  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const template = document.getElementById(
      'account-add-dialog-template',
    ) as HTMLTemplateElement
    shadowRoot.appendChild(template.content.cloneNode(true))

    this.addButton = shadowRoot.getElementById(
      'add-button',
    ) as HTMLButtonElement
    this.addDialog = shadowRoot.getElementById(
      'add-dialog',
    ) as HTMLDialogElement
    const addForm = shadowRoot.getElementById('add-form') as HTMLFormElement
    const addFormCancelButton = shadowRoot.getElementById(
      'add-form-cancel',
    ) as HTMLButtonElement

    this.addButton.addEventListener('click', () => {
      this.openAddDialog()
    })

    this.addDialog.addEventListener('close', async () => {
      if (this.addDialog?.returnValue === 'submit') {
        const formData = new FormData(addForm)
        const data: AccountCreateRequest = {
          label: encodeURIComponent(formData.get('add-form-label') as string),
          secret: formData.get('add-form-secret') as string,
          type: 'totp',
        }
        addForm.reset()
        const result = await addAccount(data)
        this.appendAccountCard(result)
      }
      this.closeAddDialog()
    })

    addFormCancelButton.addEventListener('click', (event) => {
      event.preventDefault()
      this.addDialog?.close(addFormCancelButton.value)
    })
  }

  private openAddDialog() {
    this.addButton?.setAttribute('aria-expanded', 'true')
    this.addButton?.setAttribute('aria-controls', 'add-dialog')
    this.addDialog?.showModal()
  }

  private closeAddDialog() {
    this.addButton?.removeAttribute('aria-expanded')
    this.addButton?.removeAttribute('aria-controls')
  }

  private appendAccountCard(data: Account) {
    const accountsListSection = document.getElementById(
      'accounts-list',
    ) as HTMLElement
    const element = document.createElement('account-card')
    const period = (data as TOTP).period
    element.setAttribute('id', String(data.id))
    element.setAttribute('label', data.label)
    if (period) {
      element.setAttribute('period', String(period))
    }
    accountsListSection.prepend(element)
  }
}
