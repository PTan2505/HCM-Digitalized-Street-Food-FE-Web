interface ShowAvatarModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  avatarFile: File | null;
  setAvatarFile: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  updateAvatar: (file: File) => Promise<{ success: boolean }>;
  loading: boolean;
  getProfileApi: () => Promise<{ data: Record<string, unknown> }>;
  setUser: (user: Record<string, unknown>) => void;
}

export default function ShowAvatarModal({
  show,
  setShow,
  avatarFile,
  setAvatarFile,
  previewUrl,
  setPreviewUrl,
  updateAvatar,
  loading,
  getProfileApi,
  setUser,
}: ShowAvatarModalProps): JSX.Element | null {
  if (!show) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!avatarFile) return;

    const result = await updateAvatar(avatarFile);
    if (result.success) {
      const profile = await getProfileApi();
      setUser(profile.data);
      setShow(false);
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Cập nhật Avatar</h2>

        {previewUrl && (
          <div className="mb-4 flex justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-32 w-32 rounded-full object-cover"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 w-full"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShow(false)}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleUpload}
            disabled={!avatarFile || loading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : 'Cập nhật'}
          </button>
        </div>
      </div>
    </div>
  );
}
