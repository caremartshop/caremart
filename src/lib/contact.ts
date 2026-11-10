/** Official CareMart contact details — the single source of truth for the whole site. */
export const SUPPORT_PHONE_LOCAL = '0781015211';
export const SUPPORT_PHONE_E164 = '+250781015211';
export const SUPPORT_PHONE_DISPLAY = '+250 781 015 211';
export const SUPPORT_WHATSAPP_DIGITS = '250781015211';
export const SUPPORT_EMAIL = 'support@tumacaremart.shop';

export const supportTelLink = `tel:${SUPPORT_PHONE_E164}`;
export const supportMailLink = `mailto:${SUPPORT_EMAIL}`;
export const supportWhatsAppLink = (text?: string) =>
  `https://wa.me/${SUPPORT_WHATSAPP_DIGITS}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
