import { useEffect, useRef, useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { toast } from 'sonner';

import { useUpdateDisplayPicture } from '@/hooks/use-profile-query';
import { useAuthStore } from '@/store/auth.store';
import IconBtn from '../../../common/IconBtn';

const ChangeProfilePicture = () => {
  const user = useAuthStore((s) => s.user);
  const [previewSource, setPreviewSource] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadPicture, isPending } = useUpdateDisplayPicture();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);
    }
  };

  const handleFileUpload = () => {
    if (!imageFile) {
      toast.error('Please select an image before uploading');
      return;
    }

    uploadPicture(imageFile, {
      onSuccess: () => {
        setImageFile(null);
        setPreviewSource(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  useEffect(() => {
    if (!imageFile) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = () => setPreviewSource(reader.result as string);
  }, [imageFile]);

  return (
    <div>
      <div className="border-global-stroke-primary bg-global-bg-surface text-global-text-primary flex items-center justify-between rounded-md border-[1px] p-8 px-12">
        <div className="flex items-center gap-x-4">
          <img
            src={previewSource || user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[78px] rounded-full object-cover"
          />
          <div className="space-y-2">
            <p>Change Profile Picture</p>
            <div className="flex flex-row gap-2 md:gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/gif, image/jpeg"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="bg-global-card-surface-2 text-global-text-secondary cursor-pointer rounded-md px-5 py-2 font-semibold"
              >
                Select
              </button>

              <IconBtn text={isPending ? 'Uploading...' : 'Upload'} onclick={handleFileUpload}>
                {!isPending && <FiUpload className="text-global-text-inverse text-lg" />}
              </IconBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeProfilePicture;
