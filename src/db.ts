import type { Account } from './types'

const DB_NAME = 'store'
const ACCOUNTS_STORE_NAME = 'accounts'
const ACCOUNTS_STORE_KEY = 'label'

const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
  let _db: IDBDatabase | undefined

  const openRequest = indexedDB.open(DB_NAME, 1)

  openRequest.onupgradeneeded = function () {
    _db = openRequest.result
    if (!_db.objectStoreNames.contains(ACCOUNTS_STORE_NAME)) {
      _db.createObjectStore(ACCOUNTS_STORE_NAME, {
        keyPath: ACCOUNTS_STORE_KEY,
      })
    }
  }

  openRequest.onerror = function () {
    console.error('[indexedDB]', openRequest.error)
    reject(openRequest.error)
  }

  openRequest.onsuccess = function () {
    _db = openRequest.result
    resolve(_db)

    _db.onversionchange = function () {
      _db?.close()
      alert(
        'База данных устарела, пожалуйста, перезагрузите страницу или закройте вкладку.',
      )
    }
  }

  openRequest.onblocked = function () {
    alert(
      'Открыты вкладки с устаревшими данными, пожалуйста, перезагрузите или закройте эти вкладки.',
    )
  }
})

async function useDb() {
  try {
    const db = await dbPromise
    return db
  } catch (error) {
    throw error
  }
}

function resolveRequest<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = function () {
      resolve(request.result)
    }
    request.onerror = function () {
      reject(request.error)
    }
  })
}

export async function addAccount(item: Account) {
  const db = await useDb()
  const transaction = db.transaction(ACCOUNTS_STORE_NAME, 'readwrite')
  const accounts = transaction.objectStore(ACCOUNTS_STORE_NAME)
  const request = accounts.add({
    ...item,
    createdAt: new Date().getTime(),
  })
  const result = await resolveRequest<IDBValidKey>(request)
  return result
}

export async function updateAccount(item: Account) {
  const db = await useDb()
  const transaction = db.transaction(ACCOUNTS_STORE_NAME, 'readwrite')
  const accounts = transaction.objectStore(ACCOUNTS_STORE_NAME)
  const request = accounts.put({
    ...item,
  })
  const result = await resolveRequest<IDBValidKey>(request)
  return result
}

export async function deleteAccount(key: IDBValidKey) {
  const db = await useDb()
  const transaction = db.transaction(ACCOUNTS_STORE_NAME, 'readwrite')
  const accounts = transaction.objectStore(ACCOUNTS_STORE_NAME)
  const request = accounts.delete(key)
  const result = await resolveRequest<undefined>(request)
  return result
}

export async function getAccounts() {
  const db = await useDb()
  const transaction = db.transaction(ACCOUNTS_STORE_NAME, 'readonly')
  const accounts = transaction.objectStore(ACCOUNTS_STORE_NAME)
  const request = accounts.getAll()
  const result = await resolveRequest<Account[]>(request)
  return result
}
