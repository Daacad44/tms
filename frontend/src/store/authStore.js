import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (user, accessToken, refreshToken) => {
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                });
                // Also store in localStorage for API interceptor
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
            },

            updateUser: (user) => {
                set({ user });
            },

            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            },

            isAdmin: () => {
                const { user } = get();
                return user && ['SUPER_ADMIN', 'ADMIN'].includes(user.role);
            },

            isStaff: () => {
                const { user } = get();
                return user && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'FINANCE'].includes(user.role);
            },

            hasRole: (roles) => {
                const { user } = get();
                if (!user) return false;
                return roles.includes(user.role);
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
