import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reportsApi } from '@/lib/api';
import { Loader2, DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    // Fetch dashboard summary
    const { data: summaryData, isLoading, error } = useQuery({
        queryKey: ['admin', 'summary'],
        queryFn: () => reportsApi.getSummary(),
    });

    const stats = summaryData?.data?.data || {};

    if (error) {
        return (
            <div className="p-4 text-red-500 bg-red-50 rounded-lg">
                Error loading dashboard data: {error.message || 'Unknown error'}
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Bookings */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.totalBookings || 0}</div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {stats.pendingBookings || 0} pending
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Revenue */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    ${Number(stats.totalRevenue || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Customers */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Customers</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats.totalCustomers || 0}</div>
                                <p className="text-xs text-gray-500 mt-1">Active users</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity / Growth */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {stats.totalBookings > 0
                                        ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100)
                                        : 0}%
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Confirmed bookings</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Bookings Table (Preview) */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : stats.recentBookings && stats.recentBookings.length > 0 ? (
                        <div className="space-y-4">
                            {stats.recentBookings.map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">{booking.customer?.name || 'Unknown Guest'}</p>
                                        <p className="text-sm text-gray-500">{booking.departure?.trip?.title}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-bold ${booking.status === 'CONFIRMED' ? 'text-green-600' :
                                                booking.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-600'
                                            }`}>
                                            {booking.status}
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {new Date(booking.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No recent bookings found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
