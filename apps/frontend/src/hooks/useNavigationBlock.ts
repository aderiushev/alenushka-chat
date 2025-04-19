import { useBlocker } from 'react-router-dom';
import { useEffect } from 'react';

export function useNavigationBlock(textareaRef: React.RefObject<HTMLTextAreaElement>) {
  useBlocker(() => {
    if (textareaRef.current?.value) {
      const confirmed = window.confirm('Вы уверены, что хотите покинуть страницу? Несохранённые данные будут потеряны.');
      return !confirmed;
    }
    return false;
  });

  // Handle hard reload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (textareaRef.current?.value) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [textareaRef]);
}
