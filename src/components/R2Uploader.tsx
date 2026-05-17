import React, { useState } from 'react';
import { Upload, X, ArrowUp, ArrowDown, Image as ImageIcon, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import type { WCImage } from '../lib/api';

interface R2UploaderProps {
  images: WCImage[];
  onChange: (images: WCImage[]) => void;
}

export const R2Uploader: React.FC<R2UploaderProps> = ({ images, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    setError('');
    
    try {
      const uploadedImages: WCImage[] = [];
      for (const file of files) {
        // Only accept images
        if (!file.type.startsWith('image/')) continue;
        const img = await api.uploadImage(file);
        uploadedImages.push(img);
      }
      onChange([...images, ...uploadedImages]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Image upload failed. Check keys & CORS.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
  };

  const removeImage = (index: number) => {
    const nextImages = [...images];
    nextImages.splice(index, 1);
    onChange(nextImages);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const nextImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = nextImages[index];
    nextImages[index] = nextImages[targetIndex];
    nextImages[targetIndex] = temp;
    onChange(nextImages);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-slate-350 hover:border-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group shadow-2xs"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-800 transition-all duration-300 mb-3 shadow-2xs">
          <Upload size={20} className={uploading ? 'animate-bounce' : ''} />
        </div>
        <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-all duration-200">
          {uploading ? 'Uploading to R2...' : 'Drag & Drop your images here'}
        </p>
        <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG, WEBP (Max 10MB)</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-lg text-xs font-semibold">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <Sparkles size={12} className="text-slate-800" />
            Media Gallery (First image is primary)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl flex items-center justify-between transition-all duration-300 ${
                  idx === 0
                    ? 'bg-slate-100 border border-slate-850 shadow-2xs'
                    : 'bg-white border border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-50 border border-slate-250 flex items-center justify-center text-slate-400 shadow-inner">
                    {img.src ? (
                      <img src={img.src} alt={img.alt} className="object-cover w-full h-full" />
                    ) : (
                      <ImageIcon size={18} />
                    )}
                    {idx === 0 && (
                      <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
                        <span className="bg-slate-900 text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow">
                          MAIN
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-850 truncate w-36">{img.alt || `Image ${idx + 1}`}</p>
                    <p className="text-[10px] text-slate-400 truncate w-40">{img.src}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-all duration-200 cursor-pointer"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 'down')}
                    disabled={idx === images.length - 1}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-all duration-200 cursor-pointer"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all duration-200 bg-white border border-slate-200 shadow-2xs cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
