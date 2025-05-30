import { setDoc, getDoc, deleteDoc } from '@junobuild/core';

// DatastoreにBase64形式で画像を保存する代替案
export class ImageDatastoreService {
  static async uploadImageAsBase64(file: File): Promise<string> {
    try {
      // ファイルをBase64に変換
      const base64 = await this.fileToBase64(file);
      
      // メタデータと一緒に保存
      const imageDoc = {
        data: base64,
        mimeType: file.type,
        fileName: file.name,
        size: file.size,
        uploadedAt: Date.now()
      };
      
      // Datastoreに保存
      const key = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      await setDoc({
        collection: 'images',
        doc: {
          key,
          data: JSON.stringify(imageDoc)
        }
      });
      
      // Base64 data URLを返す
      return base64;
    } catch (error) {
      console.error('Failed to upload image to datastore:', error);
      throw new Error('画像のアップロードに失敗しました');
    }
  }
  
  static async getImage(key: string): Promise<string | null> {
    try {
      const doc = await getDoc({
        collection: 'images',
        key
      });
      
      if (!doc) return null;
      
      const imageDoc = JSON.parse(doc.data as string);
      return imageDoc.data;
    } catch (error) {
      console.error('Failed to get image from datastore:', error);
      return null;
    }
  }
  
  static async deleteImage(key: string): Promise<void> {
    try {
      // Junoのdatastore APIではkeyで直接削除できる
      const existingDoc = await getDoc({
        collection: 'images',
        key
      });
      
      if (existingDoc) {
        await deleteDoc({
          collection: 'images',
          doc: existingDoc
        });
      }
    } catch (error) {
      console.error('Failed to delete image from datastore:', error);
    }
  }
  
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}