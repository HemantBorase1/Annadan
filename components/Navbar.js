'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import { Menu, X, User } from 'lucide-react'
import { useAuthContext } from '../lib/auth-context'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated } = useAuthContext()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/donate', label: 'Donate' },
    { href: '/ai-recipe', label: 'AI Recipe' },
    { href: '/feedback', label: 'Feedback' },
  ]

  return (
    <nav
      className="sticky top-0 z-50 bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur border-b border-gray-200 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" aria-label="AnnaDan Home" className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md">
              <Image
                src="/Logo.png"
                alt="AnnaDan logo"
                width={48}
                height={48}
                priority
                className="rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline gap-2 lg:gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth Buttons and Profile */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-2">
              {isAuthenticated ? (
                <Button variant="ghost" size="sm" asChild className="focus-visible:ring-2 focus-visible:ring-emerald-500">
                  <Link href="/profile" aria-label="Profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="focus-visible:ring-2 focus-visible:ring-emerald-500">
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button asChild className="focus-visible:ring-2 focus-visible:ring-emerald-500">
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2 focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            id="mobile-menu"
            className="relative px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 shadow-md rounded-b-xl text-center"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-emerald-600 block px-3 py-2 rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex flex-col space-y-2 items-center">
                {isAuthenticated ? (
                  <Button variant="ghost" asChild className="justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 w-full max-w-xs">
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      <User className="h-5 w-5 mr-2" />
                      Profile
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 w-full max-w-xs">
                      <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 w-full max-w-xs">
                      <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
