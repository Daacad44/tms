import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authApi.login(formData);
            const { user, accessToken, refreshToken } = response.data.data;

            setAuth(user, accessToken, refreshToken);

            toast({
                title: 'Success',
                description: `Welcome back, ${user.name}!`,
            });

            // Use window.location.href to ensure a clean state reload for the admin dashboard
            // This prevents router state race conditions
            setTimeout(() => {
                if (['SUPER_ADMIN', 'ADMIN', 'AGENT', 'FINANCE'].includes(user.role)) {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/';
                }
            }, 100);
        } catch (error) {
            console.error('Login error:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.response?.data?.message || 'Login failed',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome Back</CardTitle>
                        <CardDescription>Sign in to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>
                        <p className="text-center text-sm text-gray-600 mt-4">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary hover:underline">
                                Register
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
