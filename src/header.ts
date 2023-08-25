import { addAccount } from './data/db'
import type { Account, AccountCreateRequest, TOTP } from './types'

const addButton = document.getElementById('add-button') as HTMLButtonElement
const addDialog = document.getElementById('add-dialog') as HTMLDialogElement
const addForm = document.getElementById('add-form') as HTMLFormElement
const addFormCancelButton = document.getElementById(
  'add-form-cancel',
) as HTMLButtonElement

addButton.addEventListener('click', () => {
  openAddDialog()
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
    const result = await addAccount(data)
    appendAccountCard(result)
  }
  closeAddDialog()
})

addFormCancelButton.addEventListener('click', (event) => {
  event.preventDefault()
  addDialog.close(addFormCancelButton.value)
})

function openAddDialog() {
  addButton.setAttribute('aria-expanded', 'true')
  addButton.setAttribute('aria-controls', 'add-dialog')
  addDialog.showModal()
}

function closeAddDialog() {
  addButton.removeAttribute('aria-expanded')
  addButton.removeAttribute('aria-controls')
}

function appendAccountCard(data: Account) {
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
