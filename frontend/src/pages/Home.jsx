import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Calendar, Users, Search, Heart, Star, Compass, ArrowRight, Loader2, Shield, Wallet, Trophy, PlayCircle, Mail, Globe, Quote, Camera, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tripsApi } from '@/lib/api';

// Fallback data for Trending Destinations (since we don't have a dedicated public destinations endpoint yet)
// In a real scenario, we would have GET /api/destinations/trending
const TRENDING_DESTINATIONS = [
    {
        id: 1,
        name: "Santorini, Greece",
        price: 1299,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800",
    },
    {
        id: 2,
        name: "Kyoto, Japan",
        price: 1599,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 3,
        name: "Amalfi Coast, Italy",
        price: 1899,
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 4,
        name: "Bora Bora",
        price: 2899,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800",
    }
];

export default function Home() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        location: '',
        date: '',
        guests: ''
    });

    // Fetch Trips for "Popular Packages"
    const { data: tripsData, isLoading, error } = useQuery({
        queryKey: ['trips', 'featured'],
        queryFn: () => tripsApi.getTrips({ limit: 6, status: 'PUBLISHED' }),
    });

    const packages = tripsData?.data?.data || [];

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchParams.location) params.append('search', searchParams.location);
        if (searchParams.date) params.append('startDate', searchParams.date);
        navigate(`/trips?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-brand-navy text-slate-50 font-sans selection:bg-brand-secondary selection:text-white">

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image & Meaningful Gradient */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000"
                        alt="Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    {/* Dark Blue Overlay (Trust) */}
                    <div className="absolute inset-0 bg-brand-navy/60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 container mx-auto px-4 pt-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 backdrop-blur-md border border-brand-primary/20 mb-8 animate-fade-in-up">
                        <Compass className="w-4 h-4 text-brand-primary" />
                        <span className="text-sm font-medium tracking-wide text-brand-primary uppercase">Curated Journeys</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tight text-white leading-tight">
                        Discover Your Next <br />
                        {/* Orange for Adventure/Excitement */}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-orange-400">
                            Adventure
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                        Experience the world with clarity and confidence. We craft unforgettable journeys tailored just for you.
                    </p>

                    {/* Glass Search Bar */}
                    <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/10 shadow-2xl shadow-brand-primary/5">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 p-2">
                            <div className="md:col-span-3 bg-brand-navy/60 rounded-xl px-4 py-3 border border-white/5 group hover:border-brand-primary/50 transition-colors cursor-pointer">
                                <label className="block text-xs text-brand-primary mb-1 uppercase tracking-wider font-bold">Location</label>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-slate-400 group-hover:text-brand-secondary transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Where to?"
                                        className="bg-transparent w-full text-white placeholder-slate-400 focus:outline-none font-medium"
                                        value={searchParams.location}
                                        onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-3 bg-brand-navy/60 rounded-xl px-4 py-3 border border-white/5 group hover:border-brand-primary/50 transition-colors cursor-pointer">
                                <label className="block text-xs text-brand-primary mb-1 uppercase tracking-wider font-bold">Date</label>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-slate-400 group-hover:text-brand-secondary transition-colors" />
                                    <input
                                        type="date"
                                        className="bg-transparent w-full text-white placeholder-slate-400 focus:outline-none font-medium [&::-webkit-calendar-picker-indicator]:invert"
                                        value={searchParams.date}
                                        onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-3 bg-brand-navy/60 rounded-xl px-4 py-3 border border-white/5 group hover:border-brand-primary/50 transition-colors cursor-pointer">
                                <label className="block text-xs text-brand-primary mb-1 uppercase tracking-wider font-bold">Guests</label>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-slate-400 group-hover:text-brand-secondary transition-colors" />
                                    <input
                                        type="number"
                                        placeholder="Add guests"
                                        className="bg-transparent w-full text-white placeholder-slate-400 focus:outline-none font-medium"
                                        value={searchParams.guests}
                                        onChange={(e) => setSearchParams({ ...searchParams, guests: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-3">
                                {/* Teal Button for Clarity and Call to Action */}
                                <Button
                                    className="w-full h-full bg-brand-primary hover:bg-cyan-600 text-white rounded-xl text-lg font-bold shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02]"
                                    onClick={handleSearch}
                                >
                                    <Search className="w-5 h-5 mr-2" />
                                    Explore
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ambient Glows (Teal/Blue) */}
                <div className="absolute top-1/4 left-10 w-64 h-64 bg-brand-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse" />
                <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse delay-700" />
            </section>

            {/* --- TRENDING SECTION (Static Fallback for now) --- */}
            <section className="py-24 relative overflow-hidden bg-brand-dark/50">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-bold text-white mb-2 font-serif">Trending <span className="text-brand-primary">Destinations</span></h2>
                            <p className="text-slate-400 text-lg">Curated spots for your next big adventure.</p>
                        </div>
                        <Button variant="ghost" className="text-brand-primary hover:text-white hover:bg-brand-primary/10 gap-2 group font-medium">
                            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {TRENDING_DESTINATIONS.map((dest, idx) => (
                            <div key={idx} className="group relative h-[420px] rounded-2xl overflow-hidden cursor-pointer shadow-xl border border-white/5 hover:border-brand-primary/30 transition-all">
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2.5 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 hover:bg-brand-secondary hover:border-brand-secondary">
                                    <Heart className="w-5 h-5 text-white" />
                                </div>

                                <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4 text-brand-secondary" />
                                        <h3 className="text-xl font-bold text-white leading-tight">{dest.name}</h3>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                                        <p className="text-slate-300 text-sm">from <span className="font-bold text-brand-primary text-lg ml-1">${dest.price}</span></p>
                                        <div className="flex items-center gap-1 text-yellow-400">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-bold text-white">{dest.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- PACKAGES SECTION (REAL DATA) --- */}
            <section className="py-24 bg-brand-navy relative">
                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-brand-secondary font-bold tracking-widest uppercase text-xs mb-2 block">Premium Tours</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white font-serif">Popular <span className="text-brand-primary">Packages</span></h2>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400 py-10">
                            Failed to load packages. Please try again later.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {packages.length > 0 ? packages.map((pkg) => (
                                <Link to={`/trips/${pkg.slug}`} key={pkg.id} className="block">
                                    <div className="bg-brand-rich/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-brand-primary/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-navy/50 h-full flex flex-col">
                                        <div className="relative h-64 overflow-hidden">
                                            <img
                                                src={pkg.image || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800"}
                                                alt={pkg.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4 bg-brand-navy/90 backdrop-blur text-white px-3 py-1 rounded-md border border-white/10 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                                                <MapPin className="w-3 h-3 text-brand-primary" />
                                                {pkg.destination?.name || "Unknown"}
                                            </div>
                                        </div>

                                        <div className="p-8 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-brand-primary transition-colors line-clamp-2">{pkg.title}</h3>
                                            </div>

                                            <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">{pkg.description}</p>

                                            <div className="flex items-center gap-5 text-sm text-slate-400 mb-8 border-b border-white/5 pb-6">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4 text-brand-secondary" />
                                                    <span className="font-medium text-slate-300">{pkg.durationDays} Days</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-4 h-4 text-brand-secondary" />
                                                    <span className="font-medium text-slate-300">Min 1</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-sm text-slate-400">from</span>
                                                    <span className="text-2xl font-bold text-brand-primary">
                                                        {pkg.minPrice ? `$${pkg.minPrice}` : 'TBD'}
                                                    </span>
                                                </div>
                                                <div className="group-hover:translate-x-1 transition-transform">
                                                    <ArrowRight className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-3 text-center text-slate-400">
                                    No trips found available for booking.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* --- 1. CORE VALUES SECTION --- */}
            <section className="py-24 bg-brand-navy border-t border-white/5">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="bg-white/5 rounded-2xl p-8 border border-white/5 hover:border-brand-primary/30 transition-colors">
                            <div className="w-14 h-14 bg-brand-primary/20 rounded-xl flex items-center justify-center mb-6 text-brand-primary">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Safe & Secure</h3>
                            <p className="text-slate-400">Your safety is our priority. We partner with vetted providers and offer 24/7 support.</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-8 border border-white/5 hover:border-brand-primary/30 transition-colors">
                            <div className="w-14 h-14 bg-brand-secondary/20 rounded-xl flex items-center justify-center mb-6 text-brand-secondary">
                                <Globe className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Authentic Travel</h3>
                            <p className="text-slate-400">Go beyond the tourist traps. Our local guides show you the real culture and hidden gems.</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-8 border border-white/5 hover:border-brand-primary/30 transition-colors">
                            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 text-green-500">
                                <Wallet className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Best Price Guarantee</h3>
                            <p className="text-slate-400">Luxury doesn't have to break the bank. We negotiate the best rates for your journey.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 2. STATS SECTION --- */}
            <section className="py-20 bg-brand-primary text-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">15k+</div>
                            <div className="text-white/80 uppercase text-xs tracking-wider font-bold">Happy Travelers</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">800+</div>
                            <div className="text-white/80 uppercase text-xs tracking-wider font-bold">Tours Completed</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">120+</div>
                            <div className="text-white/80 uppercase text-xs tracking-wider font-bold">Destinations</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">4.9</div>
                            <div className="text-white/80 uppercase text-xs tracking-wider font-bold">Average Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 3. CATEGORIES SECTION --- */}
            <section className="py-24 bg-brand-dark relative">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-brand-secondary font-bold tracking-widest uppercase text-xs mb-2 block">Find Your Style</span>
                            <h2 className="text-4xl font-bold text-white font-serif">Browse by <span className="text-brand-primary">Category</span></h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { name: 'Beach', icon: '🏖️' },
                            { name: 'Mountain', icon: '⛰️' },
                            { name: 'City', icon: 'rnrn' },
                            { name: 'Desert', icon: '🐪' },
                            { name: 'Cruise', icon: '🚢' },
                            { name: 'Camping', icon: '⛺' }
                        ].map((cat, i) => (
                            <div key={i} className="group bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-6 text-center cursor-pointer transition-all hover:-translate-y-1">
                                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                                <h3 className="font-bold text-white">{cat.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 4. SPECIAL OFFER SECTION --- */}
            <section className="py-12 bg-gradient-to-r from-orange-600 to-red-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-10">
                    <div className="text-white mb-6 md:mb-0 text-center md:text-left">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">Limited Time Deal</span>
                        <h2 className="text-3xl md:text-5xl font-bold mb-2">Summer in <span className="italic">Maldives</span></h2>
                        <p className="text-xl opacity-90">Get 20% off all Maldives packages booked this week!</p>
                    </div>
                    <div>
                        <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 font-bold text-lg px-8 shadow-xl">
                            Claim Offer
                        </Button>
                    </div>
                </div>
            </section>

            {/* --- 5. TESTIMONIALS SECTION --- */}
            <section className="py-24 bg-brand-navy relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white font-serif"> Traveler <span className="text-brand-primary">Stories</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-brand-rich p-8 rounded-2xl relative border border-white/5">
                                <Quote className="w-10 h-10 text-brand-primary/20 absolute top-6 right-6" />
                                <div className="flex text-yellow-500 mb-4 h-5">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="text-slate-300 italic mb-6 leading-relaxed">
                                    "Absolutely incredible experience! The guides were knowledgeable and the hotels were top-notch. I've never felt more taken care of."
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-700 rounded-full overflow-hidden">
                                        <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="User" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Sarah Jenkins</h4>
                                        <p className="text-xs text-slate-500 uppercase font-bold">Verified Traveler</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 6. VIDEO EXPERIENCE SECTION --- */}
            <section className="py-32 relative flex items-center justify-center">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=2000"
                        alt="Video BG"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </div>

                <div className="relative z-10 text-center text-white p-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md mb-8">
                        <Camera className="w-4 h-4" />
                        <span className="text-sm font-medium">Watch Our Journey</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-bold mb-8 font-serif">See the World <br /> Differently</h2>
                    <button className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-brand-primary transition-all duration-300 group">
                        <PlayCircle className="w-10 h-10 text-white fill-white/20 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </section>

            {/* --- 7. LATEST STORIES SECTION --- */}
            <section className="py-24 bg-brand-dark">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <h2 className="text-3xl font-bold text-white">Latest <span className="text-brand-primary">Journal</span></h2>
                        <Button variant="link" className="text-white">View All Posts</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "10 Hidden Gems in Bali", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600" },
                            { title: "Packing for a Safari", img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600" },
                            { title: "Street Food Guide: Tokyo", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600" }
                        ].map((post, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="rounded-xl overflow-hidden mb-4 relative h-64">
                                    <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-md text-xs font-bold uppercase text-brand-navy">Travel Tips</div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">{post.title}</h3>
                                <p className="text-slate-400 text-sm">Read into the details of what makes this destination magical...</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 8. NEWSLETTER SECTION --- */}
            <section className="py-24 bg-brand-navy border-b border-white/5">
                <div className="container mx-auto px-4">
                    <div className="bg-brand-rich rounded-3xl p-8 md:p-16 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px]" />

                        <div className="relative z-10 max-w-2xl mx-auto text-center">
                            <Mail className="w-12 h-12 text-brand-primary mx-auto mb-6" />
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Subscribe to our Newsletter</h2>
                            <p className="text-slate-400 mb-8 text-lg">Get travel deals, tips and inspiration sent straight to your inbox. No spam, we promise.</p>

                            <div className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary transition-colors"
                                />
                                <Button className="h-auto py-4 px-8 bg-brand-primary text-white font-bold rounded-xl hover:bg-cyan-600 text-lg">
                                    Subscribe
                                </Button>
                            </div>
                            <p className="text-slate-500 text-xs mt-4">By subscribing, you agree to our Policy and Terms.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-32 relative overflow-hidden bg-brand-dark">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=2000"
                        alt="CTA"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/90 to-transparent" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight font-serif">
                        Ready for your <br />
                        <span className="text-brand-secondary">Next Adventure?</span>
                    </h2>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                        Don't wait for the perfect moment. Take the moment and make it perfect. Join thousands of happy travelers today.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/trips">
                            <Button className="px-8 py-6 rounded-full bg-brand-secondary hover:bg-orange-600 text-white font-bold text-lg transition-colors shadow-lg shadow-brand-secondary/20">
                                Start Booking
                            </Button>
                        </Link>
                        <Button variant="outline" className="px-8 py-6 rounded-full border-white/20 text-white hover:bg-white/10 text-lg transition-colors">
                            Contact Support
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
