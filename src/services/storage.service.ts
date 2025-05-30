import { uploadFile, deleteAsset } from '@junobuild/core';

export class StorageService {
  // 画像をアップロード
  static async uploadImage(file: File): Promise<string> {
    try {
      // ファイル名を生成（タイムスタンプ + ランダム文字列）
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop() || 'jpg';
      // スラッシュを使わないファイル名にする
      const fileName = `${timestamp}-${randomStr}.${extension}`;

      // デバッグ情報を出力
      console.log('Uploading file:', {
        fileName,
        fileSize: file.size,
        fileType: file.type,
      });

      // Junoにファイルをアップロード
      const asset = await uploadFile({
        data: file,
        collection: 'images',  // Juno Storageで作成したコレクション名
      });

      // アップロードされたファイルのURLを返す
      return asset.downloadUrl;
    } catch (error) {
      console.error('Failed to upload image - Full error:', error);
      
      // エラーの詳細を表示
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // AgentErrorの場合の詳細
        if ('code' in error) {
          console.error('Error code:', (error as Record<string, unknown>).code);
        }
        if ('message' in error && error.message.includes('Storage')) {
          throw new Error(`ストレージエラー: ${error.message}`);
        }
      }
      
      throw new Error(`画像のアップロードに失敗しました: ${error}`);
    }
  }

  // 複数の画像をアップロード
  static async uploadImages(files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Failed to upload images:', error);
      throw new Error('画像のアップロードに失敗しました');
    }
  }

  // 画像を削除
  static async deleteImage(fullPath: string): Promise<void> {
    try {
      await deleteAsset({
        collection: 'images',  // 同じコレクション名を使用
        fullPath
      });
    } catch (error) {
      console.error('Failed to delete image:', error);
      // エラーを投げない（削除失敗は致命的ではない）
    }
  }

  // 画像のバリデーション
  static validateImage(file: File): { valid: boolean; error?: string } {
    // ファイルサイズチェック（5MB以下）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'ファイルサイズは5MB以下にしてください' };
    }

    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'JPEG、PNG、またはWebP形式の画像をアップロードしてください' };
    }

    return { valid: true };
  }

  // 画像のリサイズ（クライアントサイド）
  static async resizeImage(file: File, maxWidth: number = 1200, maxHeight: number = 1200): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // アスペクト比を保持してリサイズ
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            },
            file.type,
            0.9 // 品質90%
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}