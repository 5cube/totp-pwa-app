export interface HOTP {
  type: 'hotp'
  label: string
  secret: string
  issuer?: string
  algorithm?: string
  digits?: number
  counter?: number
}

export interface TOTP {
  type: 'totp'
  label: string
  secret: string
  issuer?: string
  algorithm?: string
  digits?: number
  period?: number
}

export type Account = (HOTP | TOTP) & { id: number; created?: number }
export type AccountCreateRequest = Omit<Account, 'id'>
