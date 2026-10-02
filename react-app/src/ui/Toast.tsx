import { Toaster } from 'react-hot-toast';

/** Token-styled toaster (M&M). */
export function ToastHost() {
  return (
    <Toaster
      position="bottom-center"
      gutter={8}
      containerStyle={{ bottom: 20 }}
      toastOptions={{
        duration: 3200,
        style: {
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--text-primary)',
          background: 'var(--surface-overlay)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          padding: '10px 14px',
          maxWidth: 480,
        },
        success: { iconTheme: { primary: 'var(--color-success)', secondary: 'var(--surface-card)' } },
        error: { iconTheme: { primary: 'var(--color-danger)', secondary: 'var(--surface-card)' }, duration: 6000 },
      }}
    />
  );
}
