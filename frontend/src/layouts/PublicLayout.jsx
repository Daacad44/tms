import { Link, Outlet } from 'react-router-dom';
import { Plane, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

export default function PublicLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <nav className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                            <Plane className="h-6 w-6" />
                            <span>TMS Travel</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-gray-700 hover:text-primary transition">
                                Home
                            </Link>
                            <Link to="/trips" className="text-gray-700 hover:text-primary transition">
                                Trips
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    {user?.role === 'CUSTOMER' && (
                                        <Link to="/my-bookings" className="text-gray-700 hover:text-primary transition">
                                            My Bookings
                                        </Link>
                                    )}
                                    {['SUPER_ADMIN', 'ADMIN', 'AGENT', 'FINANCE'].includes(user?.role) && (
                                        <Link to="/admin" className="text-gray-700 hover:text-primary transition">
                                            Dashboard
                                        </Link>
                                    )}
                                    <div className="flex items-center gap-3 ml-4 pl-4 border-l">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span className="text-sm font-medium">{user?.name}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Logout
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login">
                                        <Button variant="ghost">Login</Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button>Register</Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t">
                            <div className="flex flex-col gap-4">
                                <Link to="/" className="text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                                    Home
                                </Link>
                                <Link to="/trips" className="text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                                    Trips
                                </Link>
                                {isAuthenticated ? (
                                    <>
                                        <Link to="/my-bookings" className="text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                                            My Bookings
                                        </Link>
                                        <Button variant="outline" onClick={handleLogout}>
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="ghost" className="w-full">Login</Button>
                                        </Link>
                                        <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full">Register</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* Main Content */}
            <main>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white mt-20">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Plane className="h-6 w-6" />
                                <span className="text-xl font-bold">TMS Travel</span>
                            </div>
                            <p className="text-gray-400">
                                Your trusted partner for memorable travel experiences.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link to="/trips" className="hover:text-white">Browse Trips</Link></li>
                                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Services</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>Umrah & Hajj Packages</li>
                                <li>International Tours</li>
                                <li>City Tours</li>
                                <li>Custom Packages</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Contact</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>Email: info@tms-travel.com</li>
                                <li>Phone: +252 612 345 678</li>
                                <li>Mogadishu, Somalia</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 TMS Travel. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
