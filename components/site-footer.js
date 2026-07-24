import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image src="/favicon/logo.png" alt="Flowternity" width={140} height={42} className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium multi-sport academy. Train with purpose.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <div className="space-y-3 text-sm">
              <a href="tel:7795310645" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
                <Phone className="w-4 h-4" />
                <span>7795 310 645</span>
              </a>
              <a href="tel:9886696155" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
                <Phone className="w-4 h-4" />
                <span>9886 696 155</span>
              </a>
              <a href="mailto:admin@flowternity.com" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
                <Mail className="w-4 h-4" />
                <span>admin@flowternity.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/memberships" className="text-muted-foreground hover:text-foreground transition">Memberships</Link></li>
              <li><Link href="/classes" className="text-muted-foreground hover:text-foreground transition">Classes</Link></li>
              <li><Link href="/trial" className="text-muted-foreground hover:text-foreground transition">Free Trial</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition">About</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition">Privacy Policy</Link></li>
              <li><Link href="/#faq" className="text-muted-foreground hover:text-foreground transition">FAQs</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Flowternity Sports. All rights reserved.</p>
          <p>Horamavu–Kalkere, Bengaluru</p>
        </div>
      </div>
    </footer>
  );
}
