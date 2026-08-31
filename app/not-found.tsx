import Link from 'next/link';

// Rendered for routes that never reach the [locale] segment (e.g. an unknown
// locale prefix). The localized 404 lives at app/[locale]/not-found.tsx.
export default function NotFound() {
  return (
    <html lang="pt-PT">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          background: '#0f0b06',
          color: '#e8dcc8',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h1 style={{ fontWeight: 300, fontSize: '2rem', margin: 0 }}>Página não encontrada</h1>
        <p style={{ opacity: 0.6, margin: 0 }}>
          A página que procura não existe ou foi movida.
        </p>
        <Link href="/" style={{ color: '#c19a5b', textDecoration: 'underline', marginTop: '0.5rem' }}>
          Voltar ao início
        </Link>
      </body>
    </html>
  );
}
