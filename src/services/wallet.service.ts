import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import type { WalletInfo } from '@/types/wallet';

// ICP Ledger Canister ID (mainnet)
const LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

// ICP Ledger IDL Factory (ICRC-1 standard)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const idlFactory = ({ IDL }: { IDL: any }) => {
  const Account = IDL.Record({
    'owner': IDL.Principal,
    'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  
  return IDL.Service({
    'icrc1_balance_of': IDL.Func([Account], [IDL.Nat], ['query']),
  });
};

export class WalletService {
  private static agent: HttpAgent | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static ledgerActor: any = null;

  private static async initializeAgent() {
    if (!this.agent) {
      this.agent = new HttpAgent({
        host: 'https://ic0.app',
      });
      
      // In production, we don't need to fetch root key
      // await this.agent.fetchRootKey();
    }
    return this.agent;
  }

  private static async getLedgerActor() {
    if (!this.ledgerActor) {
      const agent = await this.initializeAgent();
      this.ledgerActor = Actor.createActor(idlFactory, {
        agent,
        canisterId: LEDGER_CANISTER_ID,
      });
    }
    return this.ledgerActor;
  }

  static async getICPBalance(principal: string): Promise<WalletInfo> {
    try {
      const ledger = await this.getLedgerActor();
      const owner = Principal.fromText(principal);
      
      // Call icrc1_balance_of - returns nat (bigint) directly
      const balance: bigint = await ledger.icrc1_balance_of({
        owner,
        subaccount: [],
      });
      
      // Convert e8s to ICP (1 ICP = 10^8 e8s)
      const icpBalance = Number(balance) / 100_000_000;
      
      return {
        balance: icpBalance,
        rawBalance: balance,
      };
    } catch (error) {
      console.error('Failed to fetch ICP balance:', error);
      // Return 0 balance on error
      return {
        balance: 0,
        rawBalance: BigInt(0),
      };
    }
  }

  static formatICPAmount(amount: number): string {
    // Format with up to 8 decimal places, removing trailing zeros
    return amount.toFixed(8).replace(/\.?0+$/, '');
  }
}