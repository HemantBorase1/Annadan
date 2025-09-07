import Link from 'next/link'

export default function Footer() {
  const footerLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright Text */}
          <div className="text-center md:text-left">
            <p className="text-gray-600 text-sm">
              © AnnaDan 2025 — Made with ❤️ for Humanity
            </p>
          </div>

          {/* Footer Links */}
          <div className="flex space-x-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-emerald-600 text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
