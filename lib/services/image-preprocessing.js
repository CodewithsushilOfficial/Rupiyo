/**
 * Preprocesses image files/blobs on the client side using HTMLCanvasElement.
 * Resizes max dimension to 1400px and compresses to 82% JPEG quality.
 * Reduces 10-30MB camera photos to ~250KB for ultra-fast OCR.
 */
export async function preprocessImageClient(fileOrBlob) {
  if (typeof window === 'undefined' || !(fileOrBlob instanceof Blob)) {
    return fileOrBlob;
  }

  // Skip non-image blobs (e.g., PDFs)
  if (fileOrBlob.type && !fileOrBlob.type.startsWith('image/')) {
    return fileOrBlob;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(fileOrBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const MAX_DIM = 1400;
      let width = img.width;
      let height = img.height;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(fileOrBlob);
        return;
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert canvas to compressed JPEG blob
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            resolve(blob);
          } else {
            resolve(fileOrBlob);
          }
        },
        'image/jpeg',
        0.82
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(fileOrBlob);
    };

    img.src = url;
  });
}

/**
 * Base64 helper to convert Base64 string to Blob
 */
export function base64ToBlob(base64Data, contentType = 'image/jpeg') {
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const byteCharacters = atob(cleanBase64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}
