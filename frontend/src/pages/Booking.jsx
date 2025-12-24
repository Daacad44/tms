import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { tripsApi, bookingsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, Calendar, Check, CreditCard, Shield } from 'lucide-react';

export default function BookingPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [step, setStep] = useState(1);

    // Form State
    const [selectedDepartureId, setSelectedDepartureId] = useState('');
    const [passengers, setPassengers] = useState([{ fullName: '', passportNo: '' }]);
    const [loading, setLoading] = useState(false);

    // Fetch Trip Data
    const { data: tripResponse, isLoading } = useQuery({
        queryKey: ['trip', slug],
        queryFn: () => tripsApi.getTripBySlug(slug),
    });
    const trip = tripResponse?.data?.data;

    // Create Booking Mutation
    const createBooking = useMutation({
        mutationFn: bookingsApi.createBooking,
        onSuccess: () => {
            toast({
                title: "Booking Successful!",
                description: "Your trip has been booked. Redirecting to your bookings...",
            });
            navigate('/my-bookings');
        },
        onError: (error) => {
            toast({
                title: "Booking Failed",
                description: error.response?.data?.message || "Something went wrong.",
                variant: "destructive",
            });
        }
    });

    const handlePassengerChange = (index, field, value) => {
        const newPassengers = [...passengers];
        newPassengers[index][field] = value;
        setPassengers(newPassengers);
    };

    const addPassenger = () => {
        setPassengers([...passengers, { fullName: '', passportNo: '' }]);
    };

    const removePassenger = (index) => {
        const newPassengers = passengers.filter((_, i) => i !== index);
        setPassengers(newPassengers);
    };

    const handleSubmit = async () => {
        if (!selectedDepartureId) {
            toast({ title: "Please select a departure date", variant: "destructive" });
            return;
        }

        createBooking.mutate({
            departureId: selectedDepartureId,
            passengers: passengers
        });
    };

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
    if (!trip) return <div className="text-center py-20">Trip not found</div>;

    const selectedDeparture = trip.departures?.find(d => d.id === selectedDepartureId);

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-2">Book Your Trip</h1>
            <p className="text-gray-500 mb-8">{trip.title}</p>

            {/* Steps Indicator */}
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}>1</div>
                <div className="h-1 flex-1 bg-gray-200">
                    <div className={`h-full bg-brand-primary transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`} />
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}>2</div>
                <div className="h-1 flex-1 bg-gray-200">
                    <div className={`h-full bg-brand-primary transition-all duration-300 ${step >= 3 ? 'w-full' : 'w-0'}`} />
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}>3</div>
                <div className="h-1 flex-1 bg-gray-200">
                    <div className={`h-full bg-brand-primary transition-all duration-300 ${step >= 4 ? 'w-full' : 'w-0'}`} />
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 4 ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}>4</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border p-6 md:p-8">

                {/* STEP 1: Select Departure */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-brand-primary" /> Select Departure Date
                        </h2>
                        <div className="grid gap-4">
                            {trip.departures?.map((dep) => (
                                <div
                                    key={dep.id}
                                    onClick={() => setSelectedDepartureId(dep.id)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center ${selectedDepartureId === dep.id ? 'border-brand-primary bg-blue-50' : 'border-gray-100 hover:border-brand-primary/50'}`}
                                >
                                    <div>
                                        <p className="font-bold text-lg">{new Date(dep.startDate).toLocaleDateString()}</p>
                                        <p className="text-sm text-gray-500">to {new Date(dep.endDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-xl text-brand-primary">${dep.basePrice}</p>
                                        <p className="text-xs text-green-600 font-medium">{dep.availableSeats} seats left</p>
                                    </div>
                                </div>
                            ))}
                            {trip.departures?.length === 0 && <p className="text-gray-500">No departures available.</p>}
                        </div>
                        <Button
                            className="w-full mt-6"
                            disabled={!selectedDepartureId}
                            onClick={() => setStep(2)}
                        >
                            Continue
                        </Button>
                    </div>
                )}

                {/* STEP 2: Passenger Details */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-brand-primary" /> Passenger Details
                        </h2>

                        {passengers.map((passenger, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                                <h3 className="font-semibold mb-3 text-sm text-gray-500">Passenger {index + 1}</h3>
                                {index > 0 && (
                                    <button
                                        onClick={() => removePassenger(index)}
                                        className="absolute top-4 right-4 text-red-400 hover:text-red-600 text-xs font-medium"
                                    >
                                        Remove
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Full Name</Label>
                                        <Input
                                            value={passenger.fullName}
                                            onChange={(e) => handlePassengerChange(index, 'fullName', e.target.value)}
                                            placeholder="As per passport"
                                        />
                                    </div>
                                    <div>
                                        <Label>Passport Number</Label>
                                        <Input
                                            value={passenger.passportNo}
                                            onChange={(e) => handlePassengerChange(index, 'passportNo', e.target.value)}
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button variant="outline" onClick={addPassenger} className="w-full border-dashed">
                            + Add Another Passenger
                        </Button>

                        <div className="flex gap-4 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                            <Button
                                className="flex-1"
                                disabled={passengers.some(p => !p.fullName)}
                                onClick={() => setStep(3)}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Review */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Check className="w-5 h-5 text-brand-primary" /> Review Booking
                        </h2>

                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Trip</span>
                                <span className="font-medium text-right">{trip.title}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium text-right">{new Date(selectedDeparture.startDate).toLocaleDateString()} - {new Date(selectedDeparture.endDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Passengers</span>
                                <div className="text-right">
                                    <span className="font-medium block">{passengers.length} Person(s)</span>
                                    {passengers.map((p, i) => (
                                        <span key={i} className="block text-xs text-gray-400">{p.fullName}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-2 flex justify-between text-xl font-bold text-brand-dark">
                                <span>Total Amount</span>
                                <span className="text-brand-primary">${selectedDeparture.basePrice * passengers.length}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                            <Button
                                className="flex-1"
                                onClick={() => setStep(4)}
                            >
                                Proceed to Payment
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Payment */}
                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-brand-primary" /> Payment details
                        </h2>

                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex justify-between items-center mb-6">
                            <span className="text-blue-800 font-medium">Total to Pay</span>
                            <span className="text-2xl font-bold text-blue-900">${selectedDeparture.basePrice * passengers.length}</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Card Holder Name</Label>
                                <Input placeholder="John Doe" />
                            </div>
                            <div>
                                <Label>Card Number</Label>
                                <div className="relative">
                                    <Input placeholder="0000 0000 0000 0000" maxLength={19} />
                                    <CreditCard className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Expiry Date</Label>
                                    <Input placeholder="MM/YY" maxLength={5} />
                                </div>
                                <div>
                                    <Label>CVC</Label>
                                    <Input placeholder="123" maxLength={3} type="password" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-4 bg-gray-50 p-3 rounded">
                            <Shield className="w-4 h-4 text-green-600" />
                            Payments are secure and encrypted.
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(3)} disabled={loading || createBooking.isPending}>Back</Button>
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 h-10"
                                onClick={handleSubmit}
                                disabled={loading || createBooking.isPending}
                            >
                                {(loading || createBooking.isPending) ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <span className="mr-2">Pay ${selectedDeparture.basePrice * passengers.length}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
