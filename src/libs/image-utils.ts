import {ref, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage';
import {storage} from '@/libs/firebaseConfig';
import {v4 as uuidv4} from 'uuid';

export async function uploadImageToStorage(file: File, folder: string): Promise<string> {
  if (!file) throw new Error('No file provided for upload.');

  const fileExtension = file.name.split('.').pop() || 'jpg';
  const uniqueFilename = `${uuidv4()}.${fileExtension}`;
  const fullPath = `${folder}/${uniqueFilename}`;

  const storageRef = ref(storage, fullPath);
  const metadata = {
    cacheControl: 'public, max-age=31536000, immutable',
  };
  const snapshot = await uploadBytes(storageRef, file, metadata);

  return await getDownloadURL(snapshot.ref);
}

export async function deleteImageFromStorage(fileUrl: string): Promise<void> {
  if (!fileUrl) return;

  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Cleanup Warning: Failed to delete old image from storage', error);
  }
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: {x: number; y: number; width: number; height: number},
  fileName: string = 'cropped-image.jpg'
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('No 2d context available');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }

        const safeName = fileName || 'cropped-image';
        const newFileName = safeName.replace(/\.[^/.]+$/, '') + '.webp';

        const file = new File([blob], newFileName, {type: 'image/webp'});
        resolve(file);
      },
      'image/webp',
      1
    );
  });
}
