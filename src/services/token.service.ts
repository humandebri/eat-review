import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// Satellite IDs from juno.config.mjs
const SATELLITE_IDS = {
  development: 'be2us-64aaa-aaaaa-qaabq-cai',
  production: '<PROD_SATELLITE_ID>'
};

// Get current satellite ID based on environment
const getSatelliteId = (): string => {
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       window.location.hostname === 'localhost';
  return isDevelopment ? SATELLITE_IDS.development : SATELLITE_IDS.production;
};

// Token configuration type
interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  maxSupply?: bigint;
  mintPerLike: bigint;
  canisterId: Principal;
}

// ICRC1 Account type
interface Account {
  owner: Principal;
  subaccount?: Uint8Array;
}

// IDL factory for the canister interface
const idlFactory = ({ IDL }: any) => {
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8))
  });

  const TokenConfig = IDL.Record({
    name: IDL.Text,
    symbol: IDL.Text,
    decimals: IDL.Nat8,
    total_supply: IDL.Nat64,
    max_supply: IDL.Opt(IDL.Nat64),
    mint_per_like: IDL.Nat64,
    canister_id: IDL.Principal
  });

  return IDL.Service({
    icrc1_balance_of: IDL.Func([Account], [IDL.Nat64], ['query']),
    like_review: IDL.Func([IDL.Text, IDL.Text], [IDL.Variant({
      Ok: IDL.Text,
      Err: IDL.Text
    })], []),
    has_user_liked_review: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], ['query']),
    get_review_likes: IDL.Func([IDL.Text], [IDL.Nat64], ['query']),
    get_token_config: IDL.Func([], [TokenConfig], ['query'])
  });
};

// Create actor instance
const createActor = async () => {
  const canisterId = getSatelliteId();
  
  // Junoの場合、直接ICメインネットに接続
  const agent = new HttpAgent({
    host: 'https://ic0.app',
    retryTimes: 3
  });

  return Actor.createActor(idlFactory, {
    agent,
    canisterId
  });
};

export class TokenService {
  /**
   * Get token balance for a user
   */
  static async getBalance(userId: string): Promise<bigint> {
    try {
      const actor = await createActor();
      const principal = Principal.fromText(userId);
      const account: Account = { 
        owner: principal,
        subaccount: undefined // ICRC-1標準に準拠するため、undefinedを明示的に設定
      };
      
      const balance = await actor.icrc1_balance_of(account) as bigint;
      return BigInt(balance);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return BigInt(0);
    }
  }

  /**
   * Like a review and mint tokens
   */
  static async likeReview(reviewId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const actor = await createActor();
      const result = await actor.like_review(reviewId, userId) as { Ok: string } | { Err: string };
      
      if ('Ok' in result) {
        return { success: true, message: result.Ok };
      } else {
        return { success: false, message: result.Err };
      }
    } catch (error) {
      console.error('Failed to like review:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to like review' 
      };
    }
  }

  /**
   * Check if user has liked a review
   */
  static async hasUserLikedReview(reviewId: string, userId: string): Promise<boolean> {
    try {
      const actor = await createActor();
      return await actor.has_user_liked_review(reviewId, userId) as boolean;
    } catch (error) {
      console.error('Failed to check if user liked review:', error);
      return false;
    }
  }

  /**
   * Get review like count
   */
  static async getReviewLikes(reviewId: string): Promise<number> {
    try {
      const actor = await createActor();
      const likes = await actor.get_review_likes(reviewId) as bigint;
      return Number(likes);
    } catch (error) {
      console.error('Failed to get review likes:', error);
      return 0;
    }
  }

  /**
   * Get token configuration
   */
  static async getTokenConfig(): Promise<TokenConfig | null> {
    try {
      const actor = await createActor();
      const config = await actor.get_token_config() as any;
      
      return {
        name: config.name,
        symbol: config.symbol,
        decimals: Number(config.decimals),
        totalSupply: BigInt(config.total_supply),
        maxSupply: config.max_supply ? BigInt(config.max_supply[0]) : undefined,
        mintPerLike: BigInt(config.mint_per_like),
        canisterId: config.canister_id
      };
    } catch (error) {
      console.error('Failed to get token config:', error);
      return null;
    }
  }

  /**
   * Format token amount for display (considering decimals)
   */
  static formatTokenAmount(amount: bigint, decimals: number = 8): string {
    const divisor = BigInt(10 ** decimals);
    const wholePart = amount / divisor;
    const fractionalPart = amount % divisor;
    
    if (fractionalPart === BigInt(0)) {
      return wholePart.toString();
    }
    
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '');
    
    return `${wholePart}.${trimmedFractional}`;
  }

  /**
   * Parse token amount from string (considering decimals)
   */
  static parseTokenAmount(amountStr: string, decimals: number = 8): bigint {
    const [wholePart, fractionalPart = ''] = amountStr.split('.');
    const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
    const combined = wholePart + paddedFractional;
    return BigInt(combined);
  }
}