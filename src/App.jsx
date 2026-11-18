
import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MatchCard } from './components/MatchCard';
import { Footer } from './components/Footer';
import './App.css';

function App() {
    const [totalBookings, setTotalBookings] = useState(0);

    const matches = [
        {
            id: 1,
            team1: 'Chennai Super Kings',
            team2: 'Mumbai Indians',
            date: '15 April 2026',
            venue: 'Chennai',
            price: 800,
            availableSeats: 100
        },
        {
            id: 2,
            team1: 'Royal Challengers Bengaluru',
            team2: 'Kolkata Knight Riders',
            date: '17 April 2026',
            venue: 'Bengaluru',
            price: 1000,
            availableSeats: 80
        },
        {
            id: 3,
            team1: 'Mumbai Indians',
            team2: 'Sunrisers Hyderabad',
            date: '19 April 2026',
            venue: 'Mumbai',
            price: 900,
            availableSeats: 0
        },
        {
            id: 4,
            team1: 'Kolkata Knight Riders',
            team2: 'Chennai Super Kings',
            date: '21 April 2026',
            venue: 'Kolkata',
            price: 800,
            availableSeats: 60
        }
    ];

    function handleSelectMatch(match) {
        setTotalBookings(totalBookings + 1);
        alert(`You selected ${match.team1} vs ${match.team2}`);
    }

    return (
        <>
            <Navbar totalBookings={totalBookings} />

            <Hero />

            <main className="matches-section">
                <h2>IPL Match Schedule</h2>

                <div className="match-list">
                    {matches.map((match) => (
                        <MatchCard
                            key={match.id}
                            match={match}
                            onSelectMatch={handleSelectMatch}
                        />
                    ))}
                </div>
            </main>

            <Footer />
        </>
    );
}

export default App;
