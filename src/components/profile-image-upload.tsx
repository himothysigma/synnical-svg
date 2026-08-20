/**
 * Profile Image Upload Component
 * 
 * #37 - PFP/banner uploads
 * - Upload with immediate preview
 * - Persistence verification
 * - CDN/SVG asset path handling
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Check, X, Loader2, AlertTriangle } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  type: 'avatar' | 'banner';
  onUpload: (file: File, type: 'avatar' | 'banner') => Promise<string>; // Returns URL
  maxSize?: number; // in MB, default 5
  aspectRatio?: { width: number; height: number };
}

// Allowed file types per handoff
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 5;

export function ProfileImageUpload({
  currentImage,
  type,
  onUpload,
  maxSize = MAX_SIZE_MB,
  aspectRatio = type === 'avatar' ? { width: 1, height: 1 } : { width: 3, height: 1 },
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): string | null => {
    // Check type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please use JPEG, PNG, GIF, or WebP.';
    }

    // Check size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      return `File too large. Maximum size is ${maxSize}MB.`;
    }

    return null;
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setSuccess(false);

    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Store file and create preview
    fileRef.current = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  /**
   * Handle upload confirmation
   */
  const handleUpload = async () => {
    if (!fileRef.current) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadedUrl = await onUpload(fileRef.current, type);
      
      // Success
      setSuccess(true);
      setPreviewUrl(uploadedUrl); // Use server-returned URL (may be different)
      
      // Clear after success display
      setTimeout(() => {
        setSuccess(false);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        fileRef.current = null;
      }, 2000);

    } catch (err) {
      console.error('[Upload] Error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Cancel selection
   */
  const handleCancel = () => {
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
    fileRef.current = null;
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Determine dimensions based on type
  const isAvatar = type === 'avatar';
  const containerClass = isAvatar 
    ? 'w-24 h-24 rounded-full' 
    : 'w-full h-32 rounded-xl';
  const iconSize = isAvatar ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className="relative">
      {/* Current/Preview Image */}
      <div 
        className={`${containerClass} overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer group relative`}
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        {/* Image */}
        {(previewUrl || currentImage) ? (
          <img
            src={previewUrl || currentImage}
            alt={isAvatar ? 'Profile picture' : 'Banner'}
            className={`w-full h-full object-cover ${isAvatar ? 'rounded-full' : ''}`}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/30">
            {isAvatar ? (
              <Camera className={` ${iconSize}`} />
            ) : (
              <Upload className={` ${iconSize}`} />
            )}
            <span className="text-xs">
              {isAvatar ? 'Add photo' : 'Add banner'}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
        )}

        {/* Uploading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-pink-400 animate-spin mb-2" />
            <span className="text-xs text-white/70">Uploading...</span>
          </div>
        )}

        {/* Success indicator */}
        {success && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        aria-label={`Upload ${type} image`}
      />

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-xs text-red-400">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Action buttons when preview is shown */}
      {previewUrl && !success && !isUploading && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpload();
            }}
            className="flex-1 py-2 px-3 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Save Photo
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
            className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white/70 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Hints */}
      <p className="text-[10px] text-white/30 mt-1">
        JPEG, PNG, GIF, or WebP • Max {maxSize}MB
        {aspectRatio && ` • ${aspectRatio.width}:${aspectRatio.height} ratio preferred`}
      </p>
    </div>
  );
}

/**
 * Upload handler for production use
 * Handles CDN path rewriting for SVG environment (#37)
 */
export function createUploadHandler(userId: string) {
  return async (file: File, type: 'avatar' | 'banner'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('userId', userId);

    const response = await fetch('/api/uploads/profile', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Upload failed (${response.status})`);
    }

    const data = await response.json();

    // Return the URL - may need rewriting for SVG/CDN environment
    // In SVG context, rewrite to public/uploads path
    let url = data.url;
    
    // Check if we're in SVG environment
    if (typeof window !== 'undefined') {
      const isSvgContext = document.querySelector('foreignObject') !== null;
      if (isSvgContext && url.startsWith('/uploads/')) {
        // Rewrite to absolute URL for SVG context
        url = `${window.location.origin}${url}`;
      }
    }

    return url;
  };
}
