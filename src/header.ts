import { addAccount } from './db'
import { renderList } from './account'
import type { Account } from './types'

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
    const data: Account = {
      label: encodeURIComponent(formData.get('add-form-label') as string),
      secret: formData.get('add-form-secret') as string,
      type: 'totp',
    }
    addForm.reset()
    await addAccount(data)
    await renderList()
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
