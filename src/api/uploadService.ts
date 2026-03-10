import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from '../config/appConfig';

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload image to Cloudinary
 */
export const uploadImageToCloudinary = async (
  imageUri: string,
): Promise<UploadResult> => {
  try {
    const formData = new FormData();

    // Create file object from URI
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      type,
      name: filename,
    } as any);

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
  }
};
