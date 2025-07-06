import { useState, useEffect } from 'react';
import { Avatar, Spinner } from '@heroui/react';

interface ImagePreviewProps {
  imageUrl: string;
  alt: string;
  className?: string;
}

/**
 * Component that displays a live preview of an image URL
 * Shows loading state and error handling for invalid URLs
 */
const ImagePreview = ({ imageUrl, alt, className = "w-32 h-32" }: ImagePreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);

  useEffect(() => {
    if (!imageUrl || imageUrl.trim() === '') {
      setIsValidUrl(false);
      setHasError(false);
      setIsLoading(false);
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
      setIsValidUrl(true);
      setIsLoading(true);
      setHasError(false);
    } catch {
      setIsValidUrl(false);
      setHasError(true);
      setIsLoading(false);
    }
  }, [imageUrl]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!imageUrl || imageUrl.trim() === '') {
    return (
      <div className={`${className} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center`}>
        <span className="text-gray-500 text-sm">No image</span>
      </div>
    );
  }

  if (!isValidUrl) {
    return (
      <div className={`${className} border-2 border-red-300 rounded-lg flex items-center justify-center bg-red-50`}>
        <span className="text-red-500 text-sm text-center">Invalid URL</span>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <Spinner size="sm" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 border-2 border-red-300 rounded-lg">
          <span className="text-red-500 text-sm text-center">Failed to load</span>
        </div>
      )}
      <Avatar
        src={imageUrl}
        alt={alt}
        className={`${className} ${isLoading || hasError ? 'opacity-0' : 'opacity-100'}`}
        classNames={{ img: "object-contain" }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default ImagePreview;
