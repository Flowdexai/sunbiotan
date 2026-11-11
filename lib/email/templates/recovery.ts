// lib/email/templates/recovery.ts
import { renderTransactionalEmail, type RenderedEmail } from './layout';

type Lang = 'pt' | 'es' | 'en' | 'it' | 'fr';

const COPY: Record<Lang, {
  subject: string; heading: string; greeting: (name: string) => string;
  body: string; button: string; fallback: string; footer: string;
}> = {
  pt: {
    subject: 'Redefinir a sua palavra-passe · Sun BioTan',
    heading: 'Redefinir palavra-passe',
    greeting: (n) => (n ? `Olá, ${n},` : 'Olá,'),
    body: 'Recebemos um pedido para redefinir a palavra-passe da sua conta Sun BioTan®. Clique no botão para escolher uma nova.',
    button: 'Escolher nova palavra-passe',
    fallback: 'Se o botão não funcionar, copie e cole este link no seu navegador:',
    footer: 'Se não fez este pedido, ignore este email: a sua palavra-passe não será alterada.',
  },
  es: {
    subject: 'Restablece tu contraseña · Sun BioTan',
    heading: 'Restablecer contraseña',
    greeting: (n) => (n ? `Hola, ${n}:` : 'Hola:'),
    body: 'Hemos recibido una solicitud para restablecer la contraseña de tu cuenta Sun BioTan®. Haz clic en el botón para elegir una nueva.',
    button: 'Elegir nueva contraseña',
    fallback: 'Si el botón no funciona, copia y pega este enlace en tu navegador:',
    footer: 'Si no has hecho esta solicitud, ignora este correo: tu contraseña no se modificará.',
  },
  fr: {
    subject: 'Réinitialisez votre mot de passe · Sun BioTan',
    heading: 'Réinitialiser le mot de passe',
    greeting: (n) => (n ? `Bonjour ${n},` : 'Bonjour,'),
    body: 'Nous avons reçu une demande de réinitialisation du mot de passe de votre compte Sun BioTan®. Cliquez sur le bouton pour en choisir un nouveau.',
    button: 'Choisir un nouveau mot de passe',
    fallback: 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :',
    footer: "Si vous n'avez pas fait cette demande, ignorez cet e-mail : votre mot de passe ne sera pas modifié.",
  },
  it: {
    subject: 'Reimposta la tua password · Sun BioTan',
    heading: 'Reimposta la password',
    greeting: (n) => (n ? `Ciao ${n},` : 'Ciao,'),
    body: 'Abbiamo ricevuto una richiesta di reimpostazione della password del tuo account Sun BioTan®. Clicca sul pulsante per sceglierne una nuova.',
    button: 'Scegli una nuova password',
    fallback: 'Se il pulsante non funziona, copia e incolla questo link nel tuo browser:',
    footer: 'Se non hai effettuato questa richiesta, ignora questa email: la tua password non verrà modificata.',
  },
  en: {
    subject: 'Reset your password · Sun BioTan',
    heading: 'Reset password',
    greeting: (n) => (n ? `Hello ${n},` : 'Hello,'),
    body: 'We received a request to reset the password for your Sun BioTan® account. Click the button to choose a new one.',
    button: 'Choose a new password',
    fallback: "If the button doesn't work, copy and paste this link into your browser:",
    footer: "If you didn't make this request, ignore this email: your password will not be changed.",
  },
};

export function recoveryEmail(locale: string, name: string, link: string): RenderedEmail {
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
