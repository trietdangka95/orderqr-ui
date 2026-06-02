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
