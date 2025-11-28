"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Loader2 } from 'lucide-react';
import { createClient } from '../utils/supabase/client';

export default function AvatarUpload({ uid, url, onUpload }: { uid: string, url: string | null, onUpload: (url: string) => void }) {
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) setAvatarUrl(url);
  }, [url]);

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${uid}-${Math.random()}.${fileExt}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get the Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 3. Update User Metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      // 4. Update UI
      setAvatarUrl(publicUrl);
      onUpload(publicUrl);
      alert('Avatar updated!');

    } catch (error: any) {
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-24 h-24 mb-4 group">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-50 dark:border-green-900/30 relative bg-gray-200">
        {avatarUrl ? (
          <Image 
            src={avatarUrl} 
            alt="Avatar" 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl">
            {/* Initials Placeholder */}
            ?
          </div>
        )}
      </div>
      
      <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full border-2 border-white dark:border-slate-900 hover:bg-green-700 transition shadow-sm cursor-pointer">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        <input
          style={{ visibility: 'hidden', position: 'absolute' }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </label>
    </div>
  );
}