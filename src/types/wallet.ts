export interface ICPBalance {
  e8s: bigint; // ICP amount in e8s (1 ICP = 10^8 e8s)
}

export interface WalletInfo {
  balance: number; // ICP balance in decimal format
  rawBalance: bigint; // Raw e8s value
}