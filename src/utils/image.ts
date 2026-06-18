export const getImageUrl = (url: string | undefined): string => {
  if (!url) return 'https://placehold.co/600x400?text=No+Image';
  if (url.startsWith('http')) return url;
  
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.endsWith('orderqr.id.vn')) {
      apiUrl = 'https://api.orderqr.id.vn';
    }
  }
  
  // Ensure no double slashes if url starts with '/'
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  // Ensure apiUrl doesn't end with a slash to avoid double slash
  const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  
  return `${cleanApiUrl}${cleanUrl}`;
};

export const compressImage = (
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !file.type.startsWith("image/")) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while keeping ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG type to preserve transparency for logo images,
        // otherwise default to image/jpeg for general photos (dishes).
        const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            
            let newName = file.name;
            if (outputType === "image/jpeg" && !file.name.toLowerCase().endsWith(".jpg") && !file.name.toLowerCase().endsWith(".jpeg")) {
              newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            }

            const compressedFile = new File([blob], newName, {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputType,
          outputType === "image/jpeg" ? quality : undefined
        );
      };

      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

