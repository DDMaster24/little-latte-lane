'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay
} from '@/components/ui/dialog';
import LoginForm from '@/components/LoginForm';

export default function Header() {
  const { user, profile, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-darkBg text-neonText py-4 px-6 flex items-center justify-between shadow-neon relative">
      {/* Left Section - Logo + Title */}
      <div className="flex items-center ml-4">
        <Image
          src="/images/logo.png"
          alt="Little Latte Lane Logo"
          width={100}
          height={100}
          className="mr-8 shadow-neon"
        />
        <div>
          <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Little Latte Lane
          </h1>
          <p className="text-base">Roberts' Cafe and Deli</p>
        </div>
      </div>

      {/* Center Section - Navigation Links */}
      <div className="hidden md:flex flex-grow justify-center">
        <nav className="flex items-center space-x-6">
          <Link href="/" className="neon-button">Home</Link>
          <Link href="/menu" className="neon-button">Menu</Link>
          <Link href="/bookings" className="neon-button">Bookings</Link>
          <Link href="/account" className="neon-button">My Account</Link>
          {user && profile?.role === 'admin' && (
            <Link href="/admin" className="neon-button">Admin Panel</Link>
          )}
          <div className="flex flex-col items-center ml-6">
            <Link href="/cart">
              <ShoppingCart className="h-6 w-6 text-neonCyan hover:text-neonPink hover:shadow-neon" />
            </Link>
            <span className="text-xs text-neonText mt-1">Your Cart</span>
          </div>
        </nav>
      </div>

      {/* Right Section - Auth Area */}
      <div className="flex items-center justify-end w-60">
        {user ? (
          <div className="flex items-center space-x-2">
            <div className="flex flex-col text-sm">
              <span>Signed in as</span>
              <span>{profile?.username || user.email}</span>
            </div>
            <Button onClick={logout} className="neon-button bg-neonPink ml-4">
              Logout
            </Button>
          </div>
        ) : (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger>
              <Button className="neon-button">Login</Button>
            </DialogTrigger>
            <DialogOverlay className="fixed inset-0 backdrop-blur-md bg-black/30" />
            <DialogContent className="bg-white/40 backdrop-blur-sm border border-orange-500/50 rounded-2xl shadow-[0_0_15px_rgba(255,165,0,0.7)]">
              <DialogHeader>
                <DialogTitle className="text-white text-lg">Login or Signup</DialogTitle>
              </DialogHeader>
              <LoginForm setIsModalOpen={setIsModalOpen} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="md:hidden">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-neonCyan hover:text-neonPink hover:shadow-neon" />
          ) : (
            <Menu className="h-6 w-6 text-neonCyan hover:text-neonPink hover:shadow-neon" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <nav className="absolute top-16 left-0 w-full bg-darkBg shadow-neon md:hidden flex flex-col items-center space-y-4 py-4">
          <Link href="/" className="neon-button" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link href="/menu" className="neon-button" onClick={() => setIsMobileMenuOpen(false)}>Menu</Link>
          <Link href="/bookings" className="neon-button" onClick={() => setIsMobileMenuOpen(false)}>Bookings</Link>
          <Link href="/account" className="neon-button" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
          {user && profile?.role === 'admin' && (
            <Link href="/admin" className="neon-button" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link>
          )}
        </nav>
      )}
    </header>
  );
}
