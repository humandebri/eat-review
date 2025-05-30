'use client';

import { useState, useRef } from 'react';
import { StorageService } from '@/services/storage.service';
import { ImageDatastoreService } from '@/services/image-datastore.service';

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
  existingImages?: string[];
}

export function ImageUpload({ 
  onImagesUploaded, 
  maxImages = 5, 
  label = '画像をアップロード',
  existingImages = []
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingImages);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 最大枚数チェック
    if (uploadedUrls.length + files.length > maxImages) {
      setError(`最大${maxImages}枚まで画像をアップロードできます`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const validFiles: File[] = [];
      
      // 各ファイルをバリデーション
      for (const file of files) {
        const validation = StorageService.validateImage(file);
        if (!validation.valid) {
          setError(validation.error || '無効なファイルです');
          setUploading(false);
          return;
        }
        
        // 画像をリサイズ
        const resizedFile = await StorageService.resizeImage(file);
        validFiles.push(resizedFile);
      }

      // アップロード方法を切り替え
      let urls: string[] = [];
      
      try {
        // まずStorageを試す
        urls = await StorageService.uploadImages(validFiles);
      } catch (storageError) {
        console.warn('Storage upload failed, falling back to Datastore:', storageError);
        
        // Datastoreにフォールバック
        const uploadPromises = validFiles.map(file => 
          ImageDatastoreService.uploadImageAsBase64(file)
        );
        urls = await Promise.all(uploadPromises);
      }
      
      const newUrls = [...uploadedUrls, ...urls];
      setUploadedUrls(newUrls);
      onImagesUploaded(newUrls);
      
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    setUploadedUrls(newUrls);
    onImagesUploaded(newUrls);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
        
        {/* アップロードボタン */}
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            disabled={uploading || uploadedUrls.length >= maxImages}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
              uploading || uploadedUrls.length >= maxImages
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                アップロード中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                画像を選択
              </span>
            )}
          </label>
          <span className="text-sm text-gray-500">
            {uploadedUrls.length}/{maxImages} 枚
          </span>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* アップロード済み画像のプレビュー */}
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {uploadedUrls.map((url, index) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt={`アップロード画像 ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}