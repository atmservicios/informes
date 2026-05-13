'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ImageUploaderProps {
  informeId: string;
  onUploadComplete: (urls: string[]) => void;
  existingUrls?: string[];
}

export default function ImageUploader({
  informeId,
  onUploadComplete,
  existingUrls = [],
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingUrls);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPreviews = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeUploaded = (url: string) => {
    const updated = uploadedUrls.filter((u) => u !== url);
    setUploadedUrls(updated);
    onUploadComplete(updated);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const uploadAll = async () => {
    if (previews.length === 0) return;
    setUploading(true);
    setError('');

    const newUrls: string[] = [];

    for (const { file } of previews) {
      const ext = file.name.split('.').pop();
      const path = `informes/${informeId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('imagenes-informes')
        .upload(path, file, { contentType: file.type, upsert: false });

      if (upErr) {
        setError(`Error subiendo ${file.name}: ${upErr.message}`);
        continue;
      }

      const { data } = supabase.storage
        .from('imagenes-informes')
        .getPublicUrl(path);

      newUrls.push(data.publicUrl);
    }

    const allUrls = [...uploadedUrls, ...newUrls];
    setUploadedUrls(allUrls);
    onUploadComplete(allUrls);
    setPreviews([]);
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer"
        style={{
          borderColor: dragging ? '#4c6ef5' : 'rgba(255,255,255,0.1)',
          background: dragging ? 'rgba(76,110,245,0.08)' : 'rgba(255,255,255,0.02)',
          padding: '2rem',
        }}
      >
        <label htmlFor="image-upload" className="flex flex-col items-center gap-3 cursor-pointer">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(76,110,245,0.15)' }}
          >
            <Upload className="w-6 h-6" style={{ color: '#4c6ef5' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">
              Arrastra imágenes aquí o{' '}
              <span style={{ color: '#818cf8' }}>haz clic para seleccionar</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">JPG, PNG, WEBP hasta 10MB c/u</p>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Pending previews */}
      {previews.length > 0 && (
        <div>
          <p className="label mb-2">Listas para subir ({previews.length})</p>
          <div className="grid grid-cols-4 gap-3">
            {previews.map((p, i) => (
              <div
                key={i}
                className="relative group rounded-lg overflow-hidden aspect-square"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <img src={p.preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(239,68,68,0.85)' }}
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={uploadAll}
            disabled={uploading}
            className="btn-primary mt-3 text-sm"
          >
            {uploading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Subir {previews.length} imagen{previews.length > 1 ? 'es' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Uploaded images */}
      {uploadedUrls.length > 0 && (
        <div>
          <p className="label mb-2 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            Imágenes guardadas ({uploadedUrls.length})
          </p>
          <div className="grid grid-cols-4 gap-3">
            {uploadedUrls.map((url, i) => (
              <div
                key={i}
                className="relative group rounded-lg overflow-hidden aspect-square"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeUploaded(url)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(239,68,68,0.85)' }}
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
