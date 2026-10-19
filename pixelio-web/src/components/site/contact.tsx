/* Contact + footer — both phone lines with call / WhatsApp / copy actions.
   Ported from views/sections.js (ns.contact) + app.js (buildContacts /
   syncContactLinks / copyNumber). */

import { useState, type CSSProperties } from 'react';
import { Editable } from '@/components/site/editable';
import { CopyIcon, PhoneIcon, WhatsAppIcon } from '@/lib/pixelio/icons';
import { DEFAULT_CONTACTS } from '@/lib/pixelio/contacts';
import type { Contact } from '@/lib/pixelio/contacts';
import { useSite } from '@/site/site-context';

async function copyText(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = value;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch {
      /* nothing else to try */
    }
    ta.remove();
  }
}

function ContactCard({ contact, index }: { contact: Contact; index: number }) {
  const { t, showToast } = useSite();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await copyText(contact.local);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
    showToast(`${contact.local} — ${t('contact.copied')}`, 'success');
  };

  return (
    <div className="contact-card reveal" style={{ '--rd': `${180 + index * 90}ms` } as CSSProperties}>
      <span className="cc-label" data-i18n={contact.labelKey}>
        {t(contact.labelKey)}
      </span>
      <Editable
        as="a"
        className="cc-num"
        href={`tel:+${contact.e164}`}
        dir="ltr"
        scope="site"
        path={`contacts.${index}.display`}
        defaultValue={DEFAULT_CONTACTS[index]?.display ?? ''}
      >
        {contact.display}
      </Editable>
      <div className="cc-actions">
        <a className="btn btn-grad" href={`tel:+${contact.e164}`}>
          <PhoneIcon />
          {t('contact.call')}
        </a>
        <a className="btn btn-wa" href={`https://wa.me/${contact.e164}`} target="_blank" rel="noopener">
          <WhatsAppIcon size={16} />
          {t('contact.whatsapp')}
        </a>
        <button className="btn btn-ghost copy-btn" type="button" data-num={contact.local} onClick={onCopy}>
          <CopyIcon />
          <span>{copied ? t('contact.copied') : t('contact.copy')}</span>
        </button>
      </div>
    </div>
  );
}

export function Contact() {
  const { contacts } = useSite();

  return (
    <section className="contact section" id="contact">
      <div className="contact-inner">
        <Editable k="contact.kicker" as="p" className="section-kicker reveal" />
        <Editable k="contact.title" html as="h2" className="contact-title reveal" delay={70} />
        <Editable k="contact.sub" as="p" className="contact-sub reveal" delay={140} />

        <div className="contact-cards" id="contact-cards">
          {contacts.map((contact, i) => (
            <ContactCard key={contact.labelKey} contact={contact} index={i} />
          ))}
        </div>

        <Editable k="contact.note" as="p" className="contact-note reveal" delay={320} />
      </div>

      <footer className="footer">
        <Editable k="footer.left" />
        <span className="footer-phones" id="footer-phones" dir="ltr">
          {contacts.map((c) => c.display).join(' · ')}
        </span>
        <Editable k="footer.right" />
      </footer>
    </section>
  );
}
