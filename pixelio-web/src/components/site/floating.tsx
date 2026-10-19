/* The floating WhatsApp button and the toast — both follow the owner-editable
   contact list, exactly like syncContactLinks() kept them in sync before. */

import { WhatsAppIcon } from '@/lib/pixelio/icons';
import { useSite } from '@/site/site-context';

export function WhatsAppFab() {
  const { contacts } = useSite();
  const main = contacts[0];
  if (!main) return null;
  return (
    <a
      className="wa-fab"
      id="wa-fab-link"
      href={`https://wa.me/${main.e164}`}
      target="_blank"
      rel="noopener"
      aria-label="WhatsApp"
    >
      <WhatsAppIcon size={26} />
      <span className="wa-pulse" aria-hidden="true" />
    </a>
  );
}

export function Toast() {
  const { toast } = useSite();
  const className = toast ? `toast show ${toast.kind}` : 'toast';
  return (
    <div className={className} id="toast" role="status" aria-live="polite">
      {toast?.message ?? ''}
    </div>
  );
}
