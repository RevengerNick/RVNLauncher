/**
 * Определяет размеры и ориентацию изображения по его URL.
 * @param url URL изображения (может быть Data URL).
 * @returns Promise, который разрешается в объект с шириной, высотой и ориентацией.
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number; orientation: ImageOrientation }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let orientation: ImageOrientation;
        if (img.width > img.height) {
          orientation = 'landscape';
        } else if (img.height > img.width) {
          orientation = 'portrait';
        } else {
          orientation = 'square';
        }
        resolve({ width: img.width, height: img.height, orientation });
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = url;
    });
  }

export type ImageOrientation = 'landscape' | 'portrait' | 'square';