import { Globe, Camera, Mail, Phone, MapPin } from 'lucide-react';

const navLinks = ['Início', 'Sobre nós', 'Centros', 'Profissionais', 'Contacto'];

export function Footer() {
  return (
    <footer className="bg-sunbiotan-950 relative overflow-hidden">
      {/* Top gradient border */}
      <div className="h-px bg-gradient-to-r from-transparent via-sunbiotan-700/40 to-transparent" />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      <div className="relative container mx-auto px-6 pt-16 pb-10">
        <div className="grid md:grid-cols-4 gap-10 md:gap-8 mb-14">

          {/* Brand column */}
          <div className="md:col-span-2">
            <p className="font-display font-medium tracking-[0.2em] text-xl text-sunbiotan-300 mb-4">
              SUNBIOTAN
            </p>
            <p className="text-sunbiotan-400/55 text-sm font-light leading-relaxed mb-6 max-w-xs">
              Bronzeado natural e profissional. Elegância e expertise
              ao seu alcance em Portugal e Espanha.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 border border-sunbiotan-800/60 rounded-full flex items-center justify-center text-sunbiotan-500/60 hover:border-sunbiotan-500/60 hover:text-sunbiotan-400 transition-all duration-300"
              >
                <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 border border-sunbiotan-800/60 rounded-full flex items-center justify-center text-sunbiotan-500/60 hover:border-sunbiotan-500/60 hover:text-sunbiotan-400 transition-all duration-300"
              >
                <Camera className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/80 mb-5 font-medium">
              Navegação
            </p>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-sunbiotan-400/50 hover:text-sunbiotan-300 font-light transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-sunbiotan-500/80 mb-5 font-medium">
              Contacto
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-3.5 w-3.5 text-sunbiotan-600/70 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <a
                  href="mailto:info@sunbiotan.pt"
                  className="text-sm text-sunbiotan-400/50 hover:text-sunbiotan-300 font-light transition-colors"
                >
                  info@sunbiotan.pt
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-3.5 w-3.5 text-sunbiotan-600/70 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-sm text-sunbiotan-400/50 font-light">+351 XXX XXX XXX</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-3.5 w-3.5 text-sunbiotan-600/70 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-sm text-sunbiotan-400/50 font-light">Portugal &amp; Espanha</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-sunbiotan-800/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-sunbiotan-500/35 tracking-wider font-light">
            © {new Date().getFullYear()} Sunbiotan. Todos os direitos reservados.
          </p>
          <p className="text-[11px] text-sunbiotan-500/25 tracking-wide font-light italic">
            Bronzeado natural. Resultados profissionais.
          </p>
        </div>
      </div>
    </footer>
  );
}
