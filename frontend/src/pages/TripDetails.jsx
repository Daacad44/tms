import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Calendar, Clock, DollarSign, CheckCircle, Info } from 'lucide-react';

export default function TripDetailsPage() {
    const { slug } = useParams();

    const { data: tripResponse, isLoading, error } = useQuery({
        queryKey: ['trip', slug],
        queryFn: () => tripsApi.getTripBySlug(slug),
        enabled: !!slug
    });

    const trip = tripResponse?.data?.data;

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
        </div>
    );

    if (error || !trip) return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <h1 className="text-2xl font-bold text-red-500">Trip not found</h1>
            <Link to="/trips"><Button>Back to Trips</Button></Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Image */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <img
                    src={trip.images?.[0]?.url || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000'}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white">
                    <div className="container mx-auto">
                        <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-brand-primary text-white mb-4">
                            {trip.category}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 font-serif">{trip.title}</h1>
                        <div className="flex items-center gap-6 text-lg">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-brand-secondary" />
                                {trip.destination?.name}, {trip.destination?.country}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-brand-secondary" />
                                {trip.durationDays} Days / {trip.durationDays - 1} Nights
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Description */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Overview</h2>
                            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                                {trip.description}
                            </p>
                        </section>

                        {/* Itinerary */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Itinerary</h2>
                            <div className="space-y-8">
                                {trip.itineraries?.map((day, idx) => (
                                    <div key={day.id} className="relative pl-8 border-l-2 border-brand-primary/20 pb-8 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-primary ring-4 ring-white" />
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            Day {day.dayNo}: {day.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {day.details}
                                        </p>
                                    </div>
                                ))}
                                {(!trip.itineraries || trip.itineraries.length === 0) && (
                                    <p className="text-gray-500 italic">Detailed itinerary coming soon.</p>
                                )}
                            </div>
                        </section>

                        <div className="h-[1px] w-full bg-gray-200" />

                        {/* Inclusions / Exclusions */}
                        <section className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-5 h-5" /> What's Included
                                </h3>
                                <ul className="space-y-2 text-gray-600 list-disc pl-5">
                                    {trip.inclusions ? trip.inclusions.split('\n').map((inc, i) => (
                                        <li key={i}>{inc}</li>
                                    )) : <li>Accommodation</li>}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-700">
                                    <Info className="w-5 h-5" /> Exclusions
                                </h3>
                                <ul className="space-y-2 text-gray-600 list-disc pl-5">
                                    {trip.exclusions ? trip.exclusions.split('\n').map((exc, i) => (
                                        <li key={i}>{exc}</li>
                                    )) : <li>International Flights</li>}
                                </ul>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Booking */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                                <div className="mb-6">
                                    <span className="text-sm text-gray-500">Starting from</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-brand-navy">
                                            ${trip.departures?.[0]?.basePrice || trip.departures?.[0]?.price || 'TBD'}
                                        </span>
                                        <span className="text-gray-500">/ person</span>
                                    </div>
                                </div>

                                <div className="h-[1px] w-full bg-gray-200 my-6" />

                                <h3 className="font-bold text-gray-900 mb-4">Available Departures</h3>

                                <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
                                    {trip.departures?.length > 0 ? trip.departures.map((dep) => (
                                        <div key={dep.id} className="flex items-center justify-between p-3 rounded-lg border hover:border-brand-primary/50 cursor-pointer transition-colors bg-gray-50">
                                            <div>
                                                <p className="font-bold text-sm">
                                                    {new Date(dep.startDate).toLocaleDateString()}
                                                </p>
                                                <p className={`text-xs font-medium ${dep.availableSeats > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {dep.availableSeats > 0 ? `${dep.availableSeats} seats left` : 'Fully Booked'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono font-bold text-brand-navy">${dep.basePrice}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded">
                                            No departures scheduled yet.
                                        </p>
                                    )}
                                </div>

                                <Link to={`/trips/${slug}/book`}>
                                    <Button className="w-full h-12 text-lg font-bold bg-brand-secondary hover:bg-brand-secondary/90">
                                        Book This Trip
                                    </Button>
                                </Link>

                                <p className="text-xs text-center text-gray-400 mt-4">
                                    You won't be charged yet
                                </p>
                            </div>

                            <div className="mt-6 bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h4 className="font-bold text-blue-900 mb-2">Need Help?</h4>
                                <p className="text-sm text-blue-700 mb-4">
                                    Speak to our travel experts for personalized advice.
                                </p>
                                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-100">
                                    Contact Us
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
