/**
 * The ONLY accounts that get admin rights.
 * Keep this list in sync with `isAdminEmail()` in firestore.rules — the rules are what actually
 * protect the data; this copy only decides what the UI shows.
 */
export const ADMIN_EMAILS = ['admin@caremart.rw'];

export const isAdminEmail = (email?: string | null): boolean =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase().trim());
