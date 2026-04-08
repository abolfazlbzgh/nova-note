'use client';

import React, {useState, useCallback, useEffect} from 'react';
import Cropper, {Area} from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import {X, Crop as CropIcon} from 'lucide-react';
import {getCroppedImg} from '@/libs/image-utils';

interface ImageCropModalProps {
  isOpen: boolean;
  imageFile: File | null;
  aspectRatio?: number;
  maxWidthOrHeight?: number;
  onClose: () => void;
  onCropComplete: (processedFile: File, previewUrl: string) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageFile,
  aspectRatio = 1,
  maxWidthOrHeight = 512,
  onClose,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState({x: 0, y: 0});
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImageSrc(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [imageFile]);

  const handleCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsProcessing(true);

      const rawCroppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, imageFile?.name);

      const compressionOptions = {
        maxSizeMB: 0.15,
        maxWidthOrHeight: maxWidthOrHeight,
        useWebWorker: true,
        fileType: 'image/webp' as const,
      };

      const compressedFile = await imageCompression(rawCroppedFile, compressionOptions);
      const previewUrl = URL.createObjectURL(compressedFile);

      onCropComplete(compressedFile, previewUrl);
      onClose();
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageFile) return null;

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''} modal-bottom sm:modal-middle z-[100] backdrop-blur-sm`}>
      <div className="modal-box flex h-[80vh] max-w-2xl flex-col overflow-hidden rounded-t-2xl p-0 shadow-2xl sm:h-[600px] sm:rounded-2xl">
        <div className="border-base-200 flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <CropIcon className="text-primary h-5 w-5" />
            <h3 className="text-lg font-bold">Crop & Adjust</h3>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost" disabled={isProcessing}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-base-300 relative w-full flex-1">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
              objectFit="contain"
            />
          )}
        </div>

        <div className="bg-base-100 shrink-0 space-y-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <span className="text-base-content/70 text-sm font-medium">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="range range-xs range-primary flex-1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button className="btn btn-ghost" onClick={onClose} disabled={isProcessing}>
              Cancel
            </button>
            <button className="btn btn-primary px-8" onClick={handleSave} disabled={isProcessing}>
              {isProcessing ? <span className="loading loading-spinner loading-sm"></span> : 'Apply & Save'}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose} disabled={isProcessing}>
          close
        </button>
      </form>
    </div>
  );
};
