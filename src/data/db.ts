import type { Account, AccountCreateRequest } from '../types'

const DB_NAME = 'store'
const ACCOUNTS_STORE_NAME = 'accounts'
const ACCOUNTS_STORE_CREATED_KEY = 'created'
const ACCOUNTS_STORE_CREATED_INDEX = `${ACCOUNTS_STORE_CREATED_KEY}_idx`

const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
  let _db: IDBDatabase | undefined

  const openRequest = indexedDB.open(DB_NAME, 1)

  openRequest.onupgradeneeded = function () {
    _db = openRequest.result
    if (!_db.objectStoreNames.contains(ACCOUNTS_STORE_NAME)) {
      const store = _db.createObjectStore(ACCOUNTS_STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      })
      store.createIndex(
        ACCOUNTS_STORE_CREATED_INDEX,
        ACCOUNTS_STORE_CREATED_KEY,
      )
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

function resolveCursorRequest<T>(
  request: IDBRequest<IDBCursorWithValue | null>,
) {
  const resultArray: T[] = []

  return new Promise<T[]>((resolve) => {
    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        resultArray.push(cursor.value)
        cursor.continue()
      } else {
        resolve(resultArray)
      }
    }
  })
}

export async function addAccount(item: AccountCreateRequest) {
  const db = await useDb()
  const transaction = db.transaction(ACCOUNTS_STORE_NAME, 'readwrite')
  const accounts = transaction.objectStore(ACCOUNTS_STORE_NAME)
  const request = accounts.add({
    ...item,
    [ACCOUNTS_STORE_CREATED_KEY]: Date.now(),
  })
  const id = await resolveRequest<IDBValidKey>(request)
  return {
    ...item,
    id,
  } as Account
}

export async function updateAccount(item: Account) {
  const db = await useDb()
  const transaction = db.transaction(ACCOUNTS_STORE_NAME, 'readwrite')
  const accounts = transaction.objectStore(ACCOUNTS_STORE_NAME)
  const request = accounts.put({
    ...item,
  })
  const id = await resolveRequest<IDBValidKey>(request)
  return {
    ...item,
    id,
  } as Account
}

export async function deleteAccount(id: number | string) {
  const db = await useDb()
  const transaction = db.transaction(ACCOUNTS_STORE_NAME, 'readwrite')
  const accounts = transaction.objectStore(ACCOUNTS_STORE_NAME)
  const request = accounts.delete(Number(id))
  const result = await resolveRequest<undefined>(request)
  return result
}

export async function getAccounts() {
  const db = await useDb()
  const transaction = db.transaction(ACCOUNTS_STORE_NAME, 'readonly')
  const accounts = transaction.objectStore(ACCOUNTS_STORE_NAME)
  const createdIndex = accounts.index(ACCOUNTS_STORE_CREATED_INDEX)
  const request = createdIndex.openCursor(undefined, 'prev')
  const result = await resolveCursorRequest<Account>(request)
  return result
}
