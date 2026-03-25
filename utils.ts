
/**
 * Optimizes Unsplash images by appending width and quality parameters.
 * Helps in serving smaller images for mobile devices and ensuring images are under 80KB.
 */
export const getOptimizedImageUrl = (url: string, width: number, quality: number = 75) => {
  if (!url) return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400';
  
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=format&fit=crop&q=${quality}&w=${width}`;
  }
  return url;
};

/**
 * Generates an Unsplash srcset for responsive images.
 */
export const getSrcSet = (url: string) => {
  if (!url || !url.includes('unsplash.com')) return undefined;
  
  const baseUrl = url.split('?')[0];
  return [
    `${baseUrl}?auto=format&fit=crop&q=70&w=300 300w`,
    `${baseUrl}?auto=format&fit=crop&q=75&w=600 600w`,
    `${baseUrl}?auto=format&fit=crop&q=80&w=900 900w`
  ].join(', ');
};
