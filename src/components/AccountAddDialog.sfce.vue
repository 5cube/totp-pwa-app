<template>
  <button
    part="button button-flat button-icon"
    id="add-button"
    aria-haspopup="true"
    aria-label="Добавить"
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
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  </button>

  <dialog
    id="add-dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="add-dialog-label"
  >
    <form id="add-form">
      <h3 id="add-dialog-label">Добавить аккаунт</h3>
      <input
        part="input"
        id="add-form-label"
        type="text"
        name="add-form-label"
        placeholder="Введите label"
        aria-label="label input"
        autocomplete="off"
        required
        autofocus
      />
      <input
        part="input"
        id="add-form-secret"
        type="text"
        name="add-form-secret"
        placeholder="Введите secret"
        aria-label="secret input"
        autocomplete="off"
        required
      />
      <div>
        <button
          part="button"
          id="add-form-cancel"
          type="button"
          value="cancel"
          formmethod="dialog"
        >
          Отмена
        </button>
        <button
          part="button"
          id="add-form-submit"
          value="submit"
          formmethod="dialog"
        >
          Добавить
        </button>
      </div>
    </form>
  </dialog>
</template>

<script lang="ts">
import AccountList from './AccountList.sfce.vue'
import type { AccountCreateRequest } from '../types'

export default class AccountAddDialog extends HTMLElement {
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
</script>

<style>
#add-dialog {
  min-width: 16rem;
  border-radius: 0.75rem;
  background-color: rgb(var(--colors-bg));
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
  border-color: transparent;
}
#add-dialog::backdrop {
  background-color: rgb(255 255 255 / 0.75);
  backdrop-filter: blur(8px);
}
@media (min-width: 640px) {
  #add-dialog {
    min-width: 20rem;
  }
}
@media (prefers-color-scheme: dark) {
  #add-dialog::backdrop {
    background-color: rgb(0 0 0 / 0.75);
  }
}
h3#add-dialog-label {
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 600;
  margin: 0;
  color: rgb(var(--colors-text));
}
form#add-form {
  display: flex;
  flex-direction: column;
}
form#add-form > :not([hidden]) ~ :not([hidden]) {
  margin-top: 1.25rem;
}
button#add-form-cancel {
  color: rgb(var(--colors-text));
}
button#add-form-submit {
  color: rgb(var(--colors-primary));
  font-weight: 500;
  margin-left: 0.5rem;
}
</style>
