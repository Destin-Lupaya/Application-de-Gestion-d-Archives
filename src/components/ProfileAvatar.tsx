import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { supabaseMock as supabase } from '../lib/supabaseMock';

interface ProfileAvatarProps {
  avatarUrl: string | null;
  onAvatarUpdate: (url: string) => void;
  userId: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ avatarUrl, onAvatarUpdate, userId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const cropperRef = useRef<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setIsEditing(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCrop = async () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.cropper.getCroppedCanvas();
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob: Blob) => resolve(blob), 'image/jpeg', 0.9);
      });
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(`${userId}/avatar.jpg`, file, { upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.path);

        onAvatarUpdate(publicUrl);
        setIsEditing(false);
        setImage(null);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };

  if (isEditing && image) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-4 max-w-2xl w-full">
          <Cropper
            ref={cropperRef}
            src={image}
            style={{ height: 400, width: '100%' }}
            aspectRatio={1}
            guides={false}
          />
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => {
                setIsEditing(false);
                setImage(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              onClick={handleCrop}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Camera className="w-8 h-8" />
          </div>
        )}
      </div>
      <label
        className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700"
        htmlFor="avatar-upload"
      >
        <Camera className="w-4 h-4" />
        <input
          id="avatar-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default ProfileAvatar;