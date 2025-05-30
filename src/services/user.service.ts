import { setDoc, getDoc, listDocs } from '@junobuild/core';

const USER_COLLECTION = 'users';

export interface UserProfile {
  principalId: string;
  displayName: string;
  createdAt: number;
  updatedAt: number;
}

export class UserService {
  // ユーザープロフィールを取得
  static async getUserProfile(principalId: string): Promise<UserProfile | null> {
    try {
      const doc = await getDoc({
        collection: USER_COLLECTION,
        key: principalId
      });
      
      if (!doc || !doc.data) return null;
      
      return JSON.parse(doc.data as string) as UserProfile;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }
  
  // ユーザープロフィールを作成または更新
  static async updateUserProfile(principalId: string, displayName: string): Promise<UserProfile> {
    const timestamp = Date.now();
    
    // 既存のプロフィールを取得
    const existingProfile = await this.getUserProfile(principalId);
    
    const profile: UserProfile = {
      principalId,
      displayName: displayName.trim(),
      createdAt: existingProfile?.createdAt || timestamp,
      updatedAt: timestamp
    };
    
    await setDoc({
      collection: USER_COLLECTION,
      doc: {
        key: principalId,
        data: JSON.stringify(profile)
      }
    });
    
    return profile;
  }
  
  // 表示名が既に使用されているかチェック
  static async isDisplayNameTaken(displayName: string, excludePrincipalId?: string): Promise<boolean> {
    try {
      const { items } = await listDocs({
        collection: USER_COLLECTION,
        filter: {}
      });
      
      for (const item of items) {
        if (!item.data) continue;
        const profile = JSON.parse(item.data as string) as UserProfile;
        
        if (profile.displayName.toLowerCase() === displayName.toLowerCase() && 
            profile.principalId !== excludePrincipalId) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check display name:', error);
      return false;
    }
  }
  
  // ユーザーの表示名を取得（キャッシュ付き）
  static displayNameCache = new Map<string, string>();
  
  static async getDisplayName(principalId: string): Promise<string> {
    // キャッシュをチェック
    if (this.displayNameCache.has(principalId)) {
      return this.displayNameCache.get(principalId)!;
    }
    
    const profile = await this.getUserProfile(principalId);
    const displayName = profile?.displayName || `User-${principalId.substring(0, 8)}`;
    
    // キャッシュに保存
    this.displayNameCache.set(principalId, displayName);
    
    return displayName;
  }
  
  // キャッシュをクリア
  static clearCache(principalId?: string) {
    if (principalId) {
      this.displayNameCache.delete(principalId);
    } else {
      this.displayNameCache.clear();
    }
  }
}