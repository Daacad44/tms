import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar, Search, Loader2, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TripsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [dateFilter, setDateFilter] = useState(searchParams.get('startDate') || '');

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['trips', searchParams.toString()],
        queryFn: () => tripsApi.getTrips({
            search: searchParams.get('search'),
            startDate: searchParams.get('startDate'),
            status: 'PUBLISHED',
            limit: 20
        }),
    });

    const trips = data?.data?.data || [];
    const meta = data?.data?.meta || {};

    const handleSearch = (e) => {
        e.preventDefault();
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (dateFilter) params.startDate = dateFilter;
        setSearchParams(params);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Filter Section */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Explore Our Journeys</h1>

                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search destinations, trips..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Input
                                type="date"
                                className="w-full"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="md:w-32 bg-brand-primary hover:bg-brand-primary/90">
                            Search
                        </Button>
                    </form>
                </div>
            </div>

            {/* Results */}
            <div className="container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">
                        Error loading trips: {error.message}
                    </div>
                ) : trips.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h2 className="text-xl font-semibold mb-2">No trips found</h2>
                        <p>Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {trips.map((trip) => (
                            <Link to={`/trips/${trip.slug}`} key={trip.id} className="group block">
                                <Card className="overflow-hidden h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={trip.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800'}
                                            alt={trip.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-brand-primary shadow-sm">
                                            {trip.destination?.name || 'Destination'}
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors">
                                            {trip.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                                            {trip.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{trip.durationDays} Days</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-400 block text-right">from</span>
                                                <span className="text-xl font-bold text-brand-secondary">
                                                    {trip.minPrice ? `$${Number(trip.minPrice).toLocaleString()}` : 'TBD'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
