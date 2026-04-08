'use client';

import {useState, useRef, useEffect} from 'react';
import {User as UserIcon, Lock, Camera, Save} from 'lucide-react';
import Image from 'next/image';
import {uploadImageToStorage, deleteImageFromStorage} from '@/libs/image-utils';
import {apiClient} from '@/libs/api-client';
import {useToast, ToastType} from '@/context/ToastContext';
import {useAuth} from '@/context/AuthContext';
import {EmailAuthProvider, reauthenticateWithCredential, updatePassword} from 'firebase/auth';
import {auth} from '@/libs/firebaseConfig';
import {AxiosError} from 'axios';
import {ImageCropModal} from '@/components/ui/ImageCropModal';
import {PROFILE_PATH} from '@/libs/constants';
import {sanitizePlainText} from '@/libs/sanitize';

export default function SettingsPage() {
  const {user, refreshUser} = useAuth();
  const {addToast} = useToast();

  const [name, setName] = useState('');
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setPreviewUrl(user.photoURL || null);
    }
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      addToast('No file selected.', ToastType.WARNING);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('File size exceeds the limit of 5MB.', ToastType.ERROR);
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      addToast('Unsupported file type.', ToastType.ERROR);
      return;
    }
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

  const handleSaveProfile = async () => {
    const cleanName = sanitizePlainText(name);

    if (!cleanName.trim()) {
      addToast('Name cannot be empty.', ToastType.ERROR);
      return;
    }

    try {
      setIsSavingProfile(true);
      const oldPhotoUrl = user?.photoURL;
      let photoUrl = oldPhotoUrl;

      if (imageFile) {
        photoUrl = await uploadImageToStorage(imageFile, PROFILE_PATH);
      }

      await apiClient.patch('/api/users/profile', {
        name: cleanName,
        photoUrl,
      });

      if (imageFile && oldPhotoUrl && oldPhotoUrl.includes('firebasestorage')) {
        await deleteImageFromStorage(oldPhotoUrl);
      }

      await refreshUser();
      addToast('Profile updated successfully!', ToastType.SUCCESS);
      setImageFile(null);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        addToast(error.response.data.message, ToastType.ERROR);
      } else {
        addToast('Failed to update profile.', ToastType.ERROR);
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Please fill in all password fields.', ToastType.WARNING);
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', ToastType.ERROR);
      return;
    }

    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters long.', ToastType.ERROR);
      return;
    }

    try {
      setIsSavingPassword(true);
      if (!auth.currentUser || !user?.email) throw new Error('User not found');

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);

      addToast('Password updated successfully!', ToastType.SUCCESS);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const authError = error as {code?: string; message?: string};
      if (authError.code === 'auth/invalid-credential') {
        addToast('Incorrect current password.', ToastType.ERROR);
      } else {
        addToast('Failed to update password. Please try logging out and back in.', ToastType.ERROR);
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-2 sm:gap-8 sm:p-0">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="text-base-content/60 mt-1 text-sm sm:text-base">Manage your profile and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card bg-base-100 border-base-200 border shadow-sm">
          <div className="card-body gap-6">
            <h2 className="card-title text-lg">
              <UserIcon className="h-5 w-5" /> Profile Information
            </h2>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <div className="group relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="avatar">
                  <div className="ring-primary ring-offset-base-100 bg-base-200 relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full ring ring-offset-2">
                    {previewUrl ? (
                      <Image src={previewUrl} alt="Profile" fill sizes="96px" className="object-cover" />
                    ) : (
                      <UserIcon className="text-base-content/20 h-10 w-10" />
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-bold">Profile Picture</p>
                <p className="text-base-content/60 mt-1 text-xs">Max file size: 5MB</p>
                <p className="text-base-content/60 mt-1 text-xs">Supports JPG, PNG, JPEG.</p>
              </div>
              <input
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Display Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full opacity-60"
                value={user?.email || ''}
                readOnly
                disabled
              />
            </div>

            <div className="card-actions mt-2 justify-end">
              <button className="btn btn-primary" onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Profile
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border-base-200 h-fit border shadow-sm">
          <div className="card-body gap-6">
            <h2 className="card-title text-lg">
              <Lock className="h-5 w-5" /> Security
            </h2>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Current Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">New Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Confirm New Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="card-actions mt-2 justify-end">
              <button
                className="btn btn-neutral"
                onClick={handleSavePassword}
                disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
              >
                {isSavingPassword ? <span className="loading loading-spinner loading-sm"></span> : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ImageCropModal
        isOpen={isModalOpen}
        imageFile={rawFile}
        aspectRatio={1}
        maxWidthOrHeight={400}
        onClose={() => setIsModalOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
