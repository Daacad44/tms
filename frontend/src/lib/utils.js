import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

export function formatDate(date, options = {}) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
    }).format(new Date(date));
}

export function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

export function getDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

export function getBookingStatusColor(status) {
    const colors = {
        PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
        CANCELLED: 'bg-red-100 text-red-800 border-red-200',
        COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
        EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || colors.PENDING;
}

export function getPaymentStatusColor(status) {
    const colors = {
        INITIATED: 'bg-blue-100 text-blue-800',
        PAID: 'bg-green-100 text-green-800',
        FAILED: 'bg-red-100 text-red-800',
        REFUNDED: 'bg-purple-100 text-purple-800',
        PARTIAL: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || colors.INITIATED;
}
