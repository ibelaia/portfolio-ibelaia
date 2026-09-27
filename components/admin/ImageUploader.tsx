'use client';

import React, { useState } from 'react';
import { Upload, Check, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setTimeout(() => {
      // Dummy URL simulasi unggah gambar sukses
      const dummyUrl = URL.createObjectURL(file);
      onChange(dummyUrl);
      setUploading(false);
    }, 1200);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {value && (
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-slate-950 flex-shrink-0">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 hover:border-cyan-500/50 rounded-2xl bg-slate-950/40 cursor-pointer transition-colors">
          <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
            {uploading ? <Loader2 className="animate-spin text-cyan-400" size={18} /> : <Upload size={18} className="text-cyan-400" />}
            <span>{uploading ? 'Mengunggah gambar...' : 'Klik untuk unggah gambar'}</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">PNG, JPG, WEBP (Maks. 2MB)</span>
          <input type="file" accept="image/*" onChange={handleSimulatedUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
}