
import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MatchCard } from './components/MatchCard';
import { Footer } from './components/Footer';
import { supabase } from './supabase';
import './App.css';

function App() {
    const [totalBookings, setTotalBookings] = useState(0);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch matches from Supabase
    async function fetchMatches() {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .order('id');

        if (error) {
            setError(error.message);
        } else {
            const formattedMatches = data.map((match) => ({
                ...match,
                availableSeats: match.available_seats
            }));

            setMatches(formattedMatches);
            setError('');
        }

        setLoading(false);
    }

    // Fetch booking count from Supabase
    async function fetchBookingCount() {
        const { count, error } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Booking count error:', error.message);
        } else {
            setTotalBookings(count || 0);
        }
    }

    // Initial data fetching and Realtime subscription
    useEffect(() => {
        fetchMatches();
        fetchBookingCount();

        const channel = supabase
            .channel('ipl-live-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'matches'
                },
                () => {
                    fetchMatches();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings'
                },
                () => {
                    fetchBookingCount();
                }
            )
            .subscribe((status) => {
                console.log('Realtime status:', status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Handle ticket booking
    async function handleSelectMatch(match) {
        const name = prompt('Enter your name:');

        if (!name || !name.trim()) {
            return;
        }

        const ticketInput = prompt('Enter number of tickets:');

        if (ticketInput === null) {
            return;
        }

        const tickets = Number(ticketInput);

        if (!Number.isInteger(tickets) || tickets <= 0) {
            alert('Please enter a valid number of tickets.');
            return;
        }

        if (tickets > match.availableSeats) {
            alert('Not enough seats available!');
            return;
        }

        const totalPrice = match.price * tickets;
        const remainingSeats = match.availableSeats - tickets;

        // Update available seats
        const { data: updatedMatch, error: updateError } = await supabase
            .from('matches')
            .update({ available_seats: remainingSeats })
            .eq('id', match.id)
            .gte('available_seats', tickets)
            .select('id');

        if (updateError) {
            alert('Seat update failed: ' + updateError.message);
            return;
        }

        if (!updatedMatch || updatedMatch.length === 0) {
            alert('Seats are no longer available. Please refresh and try again.');
            return;
        }

        // Insert booking
        const { error: bookingError } = await supabase
            .from('bookings')
            .insert({
                match_id: match.id,
                user_name: name.trim(),
                match_title: `${match.team1} vs ${match.team2}`,
                tickets: tickets,
                total_price: totalPrice
            });

        if (bookingError) {
            await supabase
                .from('matches')
                .update({ available_seats: match.availableSeats })
                .eq('id', match.id);

            alert('Booking failed: ' + bookingError.message);
            return;
        }

        // Update booking count
        setTotalBookings((previous) => previous + 1);

        // Update available seats on screen
        setMatches((currentMatches) =>
            currentMatches.map((item) =>
                item.id === match.id
                    ? {
                        ...item,
                        availableSeats: remainingSeats,
                        available_seats: remainingSeats
                    }
                    : item
            )
        );

        alert('Booking successful! Your tickets are booked.');
    }

    return (
        <>
            <Navbar totalBookings={totalBookings} />

            <Hero />

            <main className="matches-section">
                <h2>IPL Match Schedule</h2>

                {loading && <p>Loading matches...</p>}

                {error && <p>Error: {error}</p>}

                {!loading && !error && (
                    <div className="match-list">
                        {matches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                onSelectMatch={handleSelectMatch}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </>
    );
}

export default App;
