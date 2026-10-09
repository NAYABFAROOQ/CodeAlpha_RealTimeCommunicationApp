import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PWAProvider } from './context/PWAContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { RoomPage } from './pages/RoomPage';
import { InstallModal } from './components/InstallModal';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' | 'auth' | 'room'
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [roomInitialData, setRoomInitialData] = useState(null);
  const { gradientPreset } = useTheme();

  // Check URL params on initial mount (e.g. ?room=abc-defg-hij)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      setActiveRoomId(roomFromUrl.trim());
      setCurrentPage('room');
    }
  }, []);

  const handleJoinRoom = (roomId, initialData = null) => {
    setActiveRoomId(roomId);
    setRoomInitialData(initialData);
    setCurrentPage('room');
    // Update URL query without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    window.history.pushState({}, '', url);
  };

  const handleLeaveRoom = () => {
    setActiveRoomId(null);
    setRoomInitialData(null);
    setCurrentPage('landing');
    // Remove query param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#120f16] text-stone-800 dark:text-stone-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white relative transition-colors duration-300">
      {/* Show Navbar on Landing and Auth Pages */}
      {currentPage !== 'room' && (
        <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
      )}

      {/* Pages */}
      <main className="flex-1 flex flex-col">
        {currentPage === 'landing' && (
          <LandingPage
            onJoinRoom={handleJoinRoom}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'auth' && (
          <AuthPage
            onNavigate={setCurrentPage}
            onSuccess={() => setCurrentPage('landing')}
          />
        )}

        {currentPage === 'room' && activeRoomId && (
          <RoomPage
            roomId={activeRoomId}
            initialRoomData={roomInitialData}
            onLeave={handleLeaveRoom}
          />
        )}
      </main>

      {/* Global Desktop App Install Modal */}
      <InstallModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PWAProvider>
        <AuthProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </AuthProvider>
      </PWAProvider>
    </ThemeProvider>
  );
}
