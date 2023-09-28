import TimerWorker from './timer-worker?worker&inline'
import { AccountAddDialog } from './components/AccountAddDialog'
import { AccountCard } from './components/AccountCard'
import { AccountCode } from './components/AccountCode'
import { AccountItem } from './components/AccountItem'
import { AccountList } from './components/AccountList'
import { CountdownTimer } from './components/CountdownTimer'
import { getAccount } from './data/db'

customElements.define('account-add-dialog', AccountAddDialog)
customElements.define('account-card', AccountCard)
customElements.define('account-code', AccountCode)
customElements.define('account-item', AccountItem)
customElements.define('account-list', AccountList)
customElements.define('countdown-timer', CountdownTimer)

export const timerWorker = new TimerWorker()

async function renderItem(id?: string) {
  const mainElement = document.querySelector('main')
  const headerElement = document.querySelector('header')
  const logoElement = headerElement?.querySelector('.logo')
  const backButtonElement = headerElement?.querySelector('.button-back')
  const listElement = document.querySelector('account-list')
  let itemElement = document.querySelector('account-item')
  const item = id ? await getAccount(id) : undefined
  if (item?.id) {
    // скрыть лого и отобразить кнопку назад в хеадера
    logoElement?.classList.add('hidden')
    backButtonElement?.classList.remove('hidden')
    // скрыть список
    listElement?.style.setProperty('display', 'none')
    // если уже имеется, то обновить
    // иначе добавить элемент аккаунта
    if (itemElement) {
      const titleElement = itemElement.querySelector(
        '[slot="title"]',
      ) as HTMLElement
      titleElement.innerText = item.label
    } else {
      const titleElement = document.createElement('h2')
      titleElement.setAttribute('slot', 'title')
      titleElement.innerText = item.label
      itemElement = document.createElement('account-item')
      itemElement.appendChild(titleElement)
      mainElement?.appendChild(itemElement)
    }
    itemElement.setAttribute('account-id', String(item.id))
    itemElement.setAttribute('label', item.label)
    const period = item.period
    if (period) {
      itemElement.setAttribute('period', String(period))
    }
  } else {
    // скрыть кнопку назад и отобразить лого в хеадера
    backButtonElement?.classList.add('hidden')
    logoElement?.classList.remove('hidden')
    // удалить элемент аккаунта
    itemElement?.remove()
    // отобразить список
    listElement?.style.removeProperty('display')
  }
}

function onHashChange() {
  const id = location.hash ? location.hash.slice(1) : undefined
  renderItem(id)
}

window.addEventListener('hashchange', onHashChange)

onHashChange()
