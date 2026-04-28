import PbiReportEmbed from './PbiReportEmbed';
import usePbiEmbed from '../../hooks/usePbiEmbed';

/**
 * Thumbnail-sized PBI embed for visual cards.
 * Only renders if authenticated and configured.
 */
export default function PbiThumbnail({ className = '' }) {
  const { embedConfig, isAuthenticated } = usePbiEmbed();

  if (!isAuthenticated || !embedConfig) return null;

  return (
    <PbiReportEmbed
      embedConfig={embedConfig}
      className={`pointer-events-none ${className}`}
    />
  );
}
