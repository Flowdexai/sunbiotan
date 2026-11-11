// lib/email/templates/invite.ts
import { renderTransactionalEmail, type RenderedEmail } from './layout';

type Lang = 'pt' | 'es' | 'en' | 'it' | 'fr';

const COPY: Record<Lang, {
  subject: string; heading: string; greeting: (name: string) => string;
  body: string; button: string; fallback: string; footer: string;
}> = {
  pt: {
    subject: 'Foi convidado para a área profissional Sun BioTan',
    heading: 'Bem-vindo à rede Sun BioTan',
    greeting: (n) => (n ? `Olá, ${n},` : 'Olá,'),
    body: 'A sua candidatura foi aprovada. Clique no botão para definir a sua palavra-passe e aceder à área profissional.',
    button: 'Definir palavra-passe',
    fallback: 'Se o botão não funcionar, copie e cole este link no seu navegador:',
    footer: 'Se não esperava este convite, pode ignorar este email. O link tem validade limitada.',
  },
  es: {
    subject: 'Te damos la bienvenida al área profesional Sun BioTan',
    heading: 'Bienvenido a la red Sun BioTan',
    greeting: (n) => (n ? `Hola, ${n}:` : 'Hola:'),
    body: 'Tu candidatura ha sido aprobada. Haz clic en el botón para definir tu contraseña y acceder al área profesional.',
    button: 'Definir contraseña',
    fallback: 'Si el botón no funciona, copia y pega este enlace en tu navegador:',
    footer: 'Si no esperabas esta invitación, puedes ignorar este correo. El enlace tiene validez limitada.',
  },
  fr: {
    subject: "Invitation à l'espace professionnel Sun BioTan",
    heading: 'Bienvenue dans le réseau Sun BioTan',
    greeting: (n) => (n ? `Bonjour ${n},` : 'Bonjour,'),
    body: "Votre candidature a été approuvée. Cliquez sur le bouton pour définir votre mot de passe et accéder à l'espace professionnel.",
    button: 'Définir le mot de passe',
    fallback: 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :',
    footer: "Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet e-mail. Le lien a une durée de validité limitée.",
  },
  it: {
    subject: "Invito all'area professionale Sun BioTan",
    heading: 'Benvenuto nella rete Sun BioTan',
    greeting: (n) => (n ? `Ciao ${n},` : 'Ciao,'),
    body: "La tua candidatura è stata approvata. Clicca sul pulsante per definire la tua password e accedere all'area professionale.",
    button: 'Definisci la password',
    fallback: 'Se il pulsante non funziona, copia e incolla questo link nel tuo browser:',
    footer: 'Se non ti aspettavi questo invito, puoi ignorare questa email. Il link ha una validità limitata.',
  },
  en: {
    subject: "You're invited to the Sun BioTan professional area",
    heading: 'Welcome to the Sun BioTan network',
    greeting: (n) => (n ? `Hello ${n},` : 'Hello,'),
    body: 'Your application has been approved. Click the button to set your password and access the professional area.',
    button: 'Set password',
    fallback: "If the button doesn't work, copy and paste this link into your browser:",
    footer: "If you weren't expecting this invitation, you can ignore this email. The link is valid for a limited time.",
  },
};

export function inviteEmail(locale: string, name: string, link: string): RenderedEmail {
  const lang: Lang = (Object.keys(COPY) as Lang[]).includes(locale as Lang) ? (locale as Lang) : 'pt';
  const c = COPY[lang];
  return renderTransactionalEmail(lang, {
    subject: c.subject,
    heading: c.heading,
    greeting: c.greeting(name.trim()),
    body: c.body,
    button: c.button,
    fallback: c.fallback,
    footer: c.footer,
  }, link);
}
