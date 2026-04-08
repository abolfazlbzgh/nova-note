'use client';

import {useState, useRef} from 'react';
import {useRouter} from 'next/navigation';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {Wand2, Save, Image as ImageIcon, Upload, Sparkles, Check, X} from 'lucide-react';
import Image from 'next/image';
import {ImageCropModal} from '@/components/ui/ImageCropModal';
import {uploadImageToStorage} from '@/libs/image-utils';
import {apiClient} from '@/libs/api-client';
import {useToast, ToastType} from '@/context/ToastContext';
import {AxiosError} from 'axios';
import {sanitizePlainText} from '@/libs/sanitize';

interface DashboardData {
  stats: {
    remainingAiUses: number;
    maxAiUses: number;
  };
}

export default function NewNotePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {addToast} = useToast();

  const [rawFile, setRawFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [draftText, setDraftText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {data: dashboardData, isLoading: isStatsLoading} = useQuery({
    queryKey: ['dashboardData'],
    queryFn: () => apiClient.get<DashboardData>('/api/notes'),
  });

  const remainingAiUses = dashboardData?.stats.remainingAiUses ?? 0;
  const isOutOfAi = !isStatsLoading && remainingAiUses <= 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFile(file);
      setIsModalOpen(true);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (processedFile: File, url: string) => {
    setImageFile(processedFile);
    setPreviewUrl(url);
  };

  const handleEnhance = async () => {
    const cleanDraft = sanitizePlainText(draftText);

    if (!cleanDraft || isOutOfAi) return;

    try {
      setIsEnhancing(true);
      const response = await apiClient.post<{enhancedText: string}>('/api/ai/enhance', {
        draftText: cleanDraft,
      });

      setEnhancedText(response.enhancedText);
      addToast('Grammar enhanced successfully!', ToastType.SUCCESS);

      queryClient.invalidateQueries({queryKey: ['dashboardData']});
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        addToast(error.response.data.message, ToastType.ERROR);
      } else {
        addToast('Failed to enhance text.', ToastType.ERROR);
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAcceptSuggestion = () => {
    setDraftText(enhancedText);
    setEnhancedText('');
  };

  const handleDiscardSuggestion = () => {
    setEnhancedText('');
  };

  const handleSave = async () => {
    if (!imageFile) {
      addToast('Please upload an image before saving.', ToastType.ERROR);
      return;
    }
    const cleanDraft = sanitizePlainText(draftText);
    const cleanEnhanced = sanitizePlainText(enhancedText);

    try {
      setIsUploading(true);

      const uploadedUrl = await uploadImageToStorage(imageFile, 'notes');

      await apiClient.post('/api/notes', {
        imageUrl: uploadedUrl,
        draftText: cleanDraft,
        enhancedText: cleanEnhanced,
      });

      addToast('Note saved successfully!', ToastType.SUCCESS);
      queryClient.invalidateQueries({queryKey: ['dashboardData']});
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        addToast(error.response.data.message, ToastType.ERROR);
      } else {
        addToast('Failed to save note.', ToastType.ERROR);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Entry</h1>
          <p className="text-base-content/60 mt-1">Upload a photo and refine your thoughts.</p>
        </div>
        <button
          onClick={handleSave}
          className="btn btn-neutral"
          disabled={!previewUrl || (!draftText && !enhancedText) || isUploading}
        >
          {isUploading ? <span className="loading loading-spinner loading-sm"></span> : <Save className="h-4 w-4" />}
          Save Entry
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card bg-base-100 border-base-200 border shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-2 text-lg">
              <ImageIcon className="h-5 w-5" /> Media
            </h2>

            {!previewUrl ? (
              <div
                className="border-base-300 hover:bg-base-200 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="text-base-content/40 mb-3 h-10 w-10" />
                <p className="text-sm font-medium">Click to upload image</p>
                <p className="text-base-content/50 mt-1 text-xs">Supports JPG, PNG, WEBP</p>
              </div>
            ) : (
              <div className="bg-base-200 border-base-300 group relative aspect-[3/4] w-full overflow-hidden rounded-lg border">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="btn btn-sm btn-primary" onClick={() => fileInputRef.current?.click()}>
                    Change Image
                  </button>
                </div>
              </div>
            )}

            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card bg-base-100 border-base-200 border shadow-sm">
            <div className="card-body flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="card-title text-lg">Caption</h2>
                <span className={`text-xs ${draftText.length > 200 ? 'text-error font-bold' : 'text-base-content/50'}`}>
                  {draftText.length} / 200
                </span>
              </div>

              <textarea
                className="textarea textarea-bordered h-32 w-full resize-none leading-relaxed"
                placeholder="Write your rough thoughts here..."
                value={draftText}
                maxLength={200}
                onChange={(e) => setDraftText(e.target.value)}
              ></textarea>

              {enhancedText ? (
                <div className="bg-primary/10 border-primary/20 rounded-xl border p-4 shadow-inner">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-primary flex items-center gap-2 font-bold">
                      <Sparkles className="h-4 w-4" /> AI Suggestion
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleDiscardSuggestion} className="btn btn-ghost btn-xs text-base-content/60">
                        <X className="h-3 w-3" /> Discard
                      </button>
                      <button onClick={handleAcceptSuggestion} className="btn btn-primary btn-xs">
                        <Check className="h-3 w-3" /> Accept
                      </button>
                    </div>
                  </div>
                  <p className="text-base-content text-sm leading-relaxed whitespace-pre-wrap">{enhancedText}</p>
                </div>
              ) : (
                <button
                  onClick={handleEnhance}
                  disabled={!draftText || draftText.length > 200 || isEnhancing || isOutOfAi || isStatsLoading}
                  className="btn btn-primary w-full"
                >
                  {isEnhancing || isStatsLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  {isOutOfAi ? 'Out of AI Enhancements' : `Enhance Grammar (${remainingAiUses} left)`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ImageCropModal
        isOpen={isModalOpen}
        imageFile={rawFile}
        aspectRatio={3 / 4}
        maxWidthOrHeight={800}
        onClose={() => setIsModalOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
