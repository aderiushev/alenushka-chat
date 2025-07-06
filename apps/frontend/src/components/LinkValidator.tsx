import { useState, useEffect } from 'react';
import { Link, Chip } from '@heroui/react';

interface LinkValidatorProps {
  url: string;
  label?: string;
  className?: string;
}

/**
 * Component that validates and displays a clickable link
 * Shows validation status and makes the link clickable if valid
 */
const LinkValidator = ({ url, label = "Внешняя ссылка", className = "" }: LinkValidatorProps) => {
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!url || url.trim() === '') {
      setIsValid(false);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);

    // Basic URL validation
    try {
      const urlObj = new URL(url);
      const isHttpOrHttps = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      setIsValid(isHttpOrHttps);
    } catch {
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  }, [url]);

  if (!url || url.trim() === '') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Chip
          startContent="🔗"
          variant="flat"
          color="default"
          size="sm"
        >
          Нет ссылки
        </Chip>
      </div>
    );
  }

  if (isValidating) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Chip
          startContent="⏳"
          variant="flat"
          color="primary"
          size="sm"
        >
          Проверка...
        </Chip>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Chip
          startContent="❌"
          variant="flat"
          color="danger"
          size="sm"
        >
          Некорректная ссылка
        </Chip>
        <span className="text-sm text-gray-500 truncate max-w-xs">{url}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Chip
        startContent="✅"
        variant="flat"
        color="success"
        size="sm"
      >
        Действительная ссылка
      </Chip>
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        color="primary"
        className="text-sm truncate max-w-xs"
        showAnchorIcon
      >
        {label}
      </Link>
    </div>
  );
};

export default LinkValidator;
