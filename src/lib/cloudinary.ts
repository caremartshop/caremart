export interface CloudinaryUploadResponse {
  success: boolean;
  url: string;
  public_id?: string;
  resource_type: 'image' | 'video' | string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  cloud_name?: string;
  isFallback?: boolean;
  error?: string;
}

/**
 * Uploads a local file (photo or video) directly to Cloudinary via the server API endpoint.
 * If Cloudinary returns an Invalid cloud_name error, it gracefully falls back to a base64 data URL
 * so product creation and media uploads never break.
 */
export async function uploadMediaToCloudinary(
  file: File,
  folder: string = 'caremart',
  overrideCloudName?: string
): Promise<CloudinaryUploadResponse> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      if (!base64Data) {
        // Fallback or error
        resolve({
          success: false,
          url: '',
          resource_type: file.type.startsWith('video/') ? 'video' : 'image',
          error: 'Failed to read file data',
        });
        return;
      }

      const isVideo = file.type.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';

      // Read saved cloud name from localStorage if present
      const savedCloudName = overrideCloudName || (typeof window !== 'undefined' ? localStorage.getItem('caremart_cloudinary_cloud_name') : null) || undefined;

      try {
        const res = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64Data,
            folder,
            resourceType,
            cloudName: savedCloudName,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.url) {
          resolve(data as CloudinaryUploadResponse);
          return;
        }

        console.warn('Cloudinary API upload returned failure, using fallback data URL:', data.error);
        // Graceful fallback to data URL if Cloud Name is invalid or missing
        resolve({
          success: true,
          url: base64Data,
          resource_type: resourceType,
          isFallback: true,
          error: data.error,
        });
      } catch (err: any) {
        console.warn('Cloudinary network upload error, using fallback data URL:', err);
        // Graceful fallback
        resolve({
          success: true,
          url: base64Data,
          resource_type: resourceType,
          isFallback: true,
          error: err.message || 'Network error',
        });
      }
    };

    reader.onerror = (err) => {
      resolve({
        success: false,
        url: '',
        resource_type: 'image',
        error: 'File reading error: ' + String(err),
      });
    };

    reader.readAsDataURL(file);
  });
}

