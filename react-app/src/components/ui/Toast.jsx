import { Toaster, toast } from 'react-hot-toast';

export { toast };

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          fontSize: '13px',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,.15)',
        },
        success: {
          iconTheme: { primary: 'var(--color-primary)', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: 'var(--color-danger)', secondary: '#fff' },
          duration: 5000,
        },
      }}
    />
  );
}
