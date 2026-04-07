'use client';

import {useState} from 'react';
import {Upload, Wand2, Save, Image as ImageIcon} from 'lucide-react';
import Image from 'next/image';

export default function DashboardPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    if (!draftText) return;

    setIsEnhancing(true);
    // TODO: Connect to actual AI API here
    setTimeout(() => {
      setEnhancedText('This is the AI-corrected version of your text, with proper grammar and better flow.');
      setIsEnhancing(false);
    }, 1500);
  };

  const handleSave = async () => {
    // TODO: Save image to Firebase Storage and text to Firestore
    console.log('Saving...', {imageFile, text: enhancedText || draftText});
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Entry</h1>
          <p className="text-base-content/60 mt-1">Upload a photo and refine your thoughts.</p>
        </div>
        <button onClick={handleSave} className="btn btn-neutral" disabled={!imageFile || (!draftText && !enhancedText)}>
          <Save className="h-4 w-4" />
          Save Entry
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card bg-base-100 border-base-200 border shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-2 text-lg">
              <ImageIcon className="h-5 w-5" /> Media
            </h2>

            <div className="form-control w-full">
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full"
                onChange={handleImageChange}
              />
            </div>

            {imagePreview && (
              <div className="bg-base-200 border-base-300 relative mt-4 aspect-video w-full overflow-hidden rounded-lg border">
                <Image src={imagePreview} alt="Preview" fill className="object-contain" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card bg-base-100 border-base-200 border shadow-sm">
            <div className="card-body flex flex-col gap-4">
              <h2 className="card-title text-lg">Caption Draft</h2>

              <textarea
                className="textarea textarea-bordered h-32 w-full resize-none"
                placeholder="Write your rough thoughts here..."
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
              ></textarea>

              <button onClick={handleEnhance} disabled={!draftText || isEnhancing} className="btn btn-primary w-full">
                {isEnhancing ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                Enhance Grammar
              </button>
            </div>
          </div>

          {enhancedText && (
            <div className="card bg-base-200 border-base-300 border shadow-inner">
              <div className="card-body">
                <h2 className="card-title text-primary text-lg">
                  <Wand2 className="h-5 w-5" /> Polished Result
                </h2>
                <p className="text-base-content mt-2 whitespace-pre-wrap">{enhancedText}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
