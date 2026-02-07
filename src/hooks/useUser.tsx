import { useState } from 'react';

export default function useUser(): {
  updateAvatar: (file: File) => Promise<{ success: boolean }>;
  loading: boolean;
} {
  const [loading, setLoading] = useState(false);

  const updateAvatar = async (
    _file: File
  ): Promise<{ success: boolean }> => {
    setLoading(true);
    try {
      // Mock upload - replace with your actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    } catch (error) {
      console.error('Upload failed:', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { updateAvatar, loading };
}
