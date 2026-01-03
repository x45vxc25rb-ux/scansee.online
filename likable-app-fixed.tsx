import React, { useState, useEffect, useRef } from 'react';
import { HandMetal, Search, Check, Clock, Mail, Heart, Wifi, QrCode, X } from 'lucide-react';

const EMOJI_LIBRARY = {
  appearance: ['👨', '👩', '🧑', '👴', '👵', '👶', '🧔', '👱', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '🧑‍🦱', '👨‍🦲', '👩‍🦲', '🧑‍🦲'],
  clothing: ['👔', '👗', '👕', '👚', '🧥', '👖', '👟', '👠', '🎩', '👒', '🧢', '👓', '🕶️', '🧣', '🧤', '👞'],
  activity: ['☕', '📚', '💻', '🎧', '✍️', '🎨', '📱', '🎮', '🍕', '🥗', '🍰', '🎵', '🎬', '📷', '🎪', '🎭'],
  location: ['🪟', '🚪', '🌳', '🏠', '🛋️', '🪑', '📍', '🗺️', '🧭', '🔆', '💡', '🕯️', '🏛️', '🌆', '🏖️', '⛰️'],
  mood: ['😊', '🤗', '😎', '🤓', '🙂', '😌', '🤝', '👋', '✨', '💭', '💬', '🎯', '🌟', '💫', '🎉', '🔥']
};

const generateMockAmbassadors = () => [
  { id: 1, distance: 5, emojis: ['👨', '☕', '💻', '🪟'], angle: 45, timestamp: Date.now() },
  { id: 2, distance: 7, emojis: ['👩', '📚', '🎧', '🛋️'], angle: 135, timestamp: Date.now() },
  { id: 3, distance: 4, emojis: ['🧑', '🍕', '😊', '🚪'], angle: 225, timestamp: Date.now() },
  { id: 4, distance: 6, emojis: ['👱', '🎨', '✨', '🌳'], angle: 315, timestamp: Date.now() }
];

export default function LikableApp() {
  const [screen, setScreen] = useState('welcome');
  const [mode, setMode] = useState(null);
  const [applicantTimeLeft, setApplicantTimeLeft] = useState(60);
  const [nearbyAmbassadors, setNearbyAmbassadors] = useState([]);
  const [selectedAmbassador, setSelectedAmbassador] = useState(null);
  const [myEmojis, setMyEmojis] = useState([]);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('appearance');
  const [incomingApplicants, setIncomingApplicants] = useState([]);
  const [showStayInTouch, setShowStayInTouch] = useState(false);
  const [stayInTouchRequested, setStayInTouchRequested] = useState(false);
  const [wifiConnected, setWifiConnected] = useState(true);

  const lastActivityTime = useRef(Date.now());

  const updateActivity = () => {
    lastActivityTime.current = Date.now();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // WiFi monitoring
  useEffect(() => {
    const wifiCheck = setInterval(() => {
      const isOnline = navigator.onLine;
      if (!isOnline && wifiConnected) {
        setWifiConnected(false);
        setScreen('disconnected');
      }
    }, 5000);
    return () => clearInterval(wifiCheck);
  }, [wifiConnected]);

  // Applicant timer (1 minute)
  useEffect(() => {
    if (mode === 'applicant' && screen === 'applicantRadar' && applicantTimeLeft > 0) {
      const timer = setInterval(() => {
        setApplicantTimeLeft(prev => {
          if (prev <= 1) {
            setMode('ambassador');
            setScreen('ambassadorSetup');
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, screen, applicantTimeLeft]);

  // Simulate incoming applicants
  useEffect(() => {
    if (screen === 'ambassadorPassive') {
      const interval = setInterval(() => {
        if (Math.random() > 0.6) {
          const newApplicant = {
            id: Date.now(),
            distance: Math.floor(Math.random() * 10) + 3,
            timestamp: Date.now()
          };
          setIncomingApplicants(prev => [...prev, newApplicant]);
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [screen]);

  const handleScanQR = () => {
    setMode('applicant');
    setScreen('applicantRadar');
    setApplicantTimeLeft(60);
    setNearbyAmbassadors(generateMockAmbassadors());
    updateActivity();
  };

  const handleSelectAmbassador = (ambassador) => {
    updateActivity();
    setSelectedAmbassador(ambassador);
    setScreen('pending');
    setTimeout(() => {
      setScreen('connected');
      setShowStayInTouch(true);
    }, 2000);
  };

  const handleAddEmoji = (emoji) => {
    if (myEmojis.length < 5 && !myEmojis.includes(emoji)) {
      setMyEmojis([...myEmojis, emoji]);
    }
  };

  const handleRemoveEmoji = (emoji) => {
    setMyEmojis(myEmojis.filter(e => e !== emoji));
  };

  const handleConfirmEmojis = () => {
    if (myEmojis.length >= 3) {
      setScreen('ambassadorPassive');
    }
  };

  const handleRespondToApplicant = (applicant) => {
    setIncomingApplicants(prev => prev.filter(a => a.id !== applicant.id));
    setSelectedAmbassador({ emojis: myEmojis, distance: applicant.distance });
    setScreen('connected');
    setShowStayInTouch(true);
  };

  // Disconnected Screen
  if (screen === 'disconnected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-6 relative">
            <Wifi className="w-12 h-12 text-gray-500" />
            <div className="absolute top-0 right-0">
              <X className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Left WiFi Zone</h2>
          <p className="text-gray-600 mb-6">
            Likable works only in the cafe's WiFi zone. Come back when you're nearby!
          </p>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              💡 The app automatically closes when you leave to ensure you're never "available" by mistake.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (screen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-green-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-orange-400 rounded-full flex items-center justify-center transform rotate-12">
              <HandMetal className="w-20 h-20 text-white transform -rotate-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Likable</h1>
          <p className="text-lg text-gray-600 mb-8">Warmth begins with an open palm</p>
          
          <div className="text-left bg-gray-50 rounded-xl p-6 mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              Find people nearby in this cafe:
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>🔍 <strong>1 min</strong>: See who's here (applicant mode)</p>
              <p>👋 <strong>After</strong>: Respond to new visitors (ambassador mode)</p>
            </div>
          </div>

          <button
            onClick={handleScanQR}
            className="w-full bg-gradient-to-r from-green-500 to-orange-500 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Scan QR Code
          </button>
          
          <p className="text-sm text-gray-500 mt-4">Look for the QR code at the entrance</p>
        </div>
      </div>
    );
  }

  // Applicant Radar Screen
  if (screen === 'applicantRadar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-green-50 to-orange-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-6 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-800">People Nearby</h2>
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span className="font-mono font-semibold">{formatTime(applicantTimeLeft)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Available for {formatTime(applicantTimeLeft)}</p>

            {/* Radar Visualization */}
            <div className="relative w-full aspect-square bg-gradient-to-br from-green-100 to-orange-100 rounded-full mb-6 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-4/5 h-4/5 border-2 border-gray-300/40 rounded-full"></div>
                <div className="absolute w-3/5 h-3/5 border-2 border-gray-300/40 rounded-full"></div>
                <div className="absolute w-2/5 h-2/5 border-2 border-gray-300/40 rounded-full"></div>
                <div className="absolute w-3 h-3 bg-orange-500 rounded-full"></div>
                
                {nearbyAmbassadors.map(amb => {
                  const rad = (amb.angle * Math.PI) / 180;
                  const dist = (amb.distance / 10) * 40;
                  return (
                    <div
                      key={amb.id}
                      className="absolute w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        left: `calc(50% + ${Math.cos(rad) * dist}% - 16px)`,
                        top: `calc(50% + ${Math.sin(rad) * dist}% - 16px)`
                      }}
                      onClick={() => handleSelectAmbassador(amb)}
                    >
                      {amb.distance}m
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {nearbyAmbassadors.length > 0 && (
            <div className="space-y-3">
              {nearbyAmbassadors.map(amb => (
                <button
                  key={amb.id}
                  onClick={() => handleSelectAmbassador(amb)}
                  className="w-full bg-white/80 backdrop-blur rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all"
                >
                  <div className="text-3xl">{amb.emojis[0]}</div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-800">{amb.emojis.join(' ')}</p>
                    <p className="text-sm text-gray-600">{amb.distance}m away</p>
                  </div>
                  <HandMetal className="w-6 h-6 text-orange-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Ambassador Setup Screen
  if (screen === 'ambassadorSetup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-50 p-4">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Emojis</h2>
          <p className="text-gray-600 mb-6">Select 3-5 emojis that describe you</p>
          
          <div className="bg-purple-50 rounded-2xl p-6 mb-6 min-h-[100px] flex flex-wrap gap-3 items-center justify-center">
            {myEmojis.length === 0 ? (
              <p className="text-gray-400 text-sm">Select emojis below</p>
            ) : (
              myEmojis.map((e, i) => (
                <button
                  key={i}
                  onClick={() => handleRemoveEmoji(e)}
                  className="text-4xl bg-white rounded-xl p-2 shadow hover:shadow-lg transition-all"
                >
                  {e}
                </button>
              ))
            )}
          </div>
          
          <p className="text-center text-sm mb-4 text-gray-600">
            {myEmojis.length}/5 • Need at least 3
          </p>
          
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {Object.keys(EMOJI_LIBRARY).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedEmojiCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  selectedEmojiCategory === cat
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-6 gap-3 mb-6 max-h-[200px] overflow-y-auto">
            {EMOJI_LIBRARY[selectedEmojiCategory].map((e, i) => (
              <button
                key={i}
                onClick={() => handleAddEmoji(e)}
                disabled={myEmojis.includes(e) || myEmojis.length >= 5}
                className={`text-3xl p-3 rounded-xl transition-all ${
                  myEmojis.includes(e)
                    ? 'bg-purple-100 opacity-50 cursor-not-allowed'
                    : 'bg-gray-50 hover:bg-purple-50 hover:scale-110'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleConfirmEmojis}
            disabled={myEmojis.length < 3}
            className={`w-full py-4 rounded-xl font-bold transition-all ${
              myEmojis.length >= 3
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Become Ambassador
          </button>
        </div>
      </div>
    );
  }

  // Ambassador Passive Screen
  if (screen === 'ambassadorPassive') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-teal-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Ambassador Mode</h2>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Active
              </div>
            </div>
            <div className="bg-green-50 rounded-2xl p-6">
              <p className="text-sm text-gray-600 mb-2">Your Profile:</p>
              <p className="text-4xl">{myEmojis.join(' ')}</p>
            </div>
          </div>
          
          {incomingApplicants.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-bold px-2 text-gray-800">
                🔔 New Requests ({incomingApplicants.length})
              </h3>
              {incomingApplicants.map(req => (
                <div
                  key={req.id}
                  className="bg-white/90 backdrop-blur rounded-2xl p-4 flex items-center gap-4 shadow-lg"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center text-2xl">
                    👋
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">Someone wants to meet!</p>
                    <p className="text-sm text-gray-600">{req.distance}m away</p>
                  </div>
                  <button
                    onClick={() => handleRespondToApplicant(req)}
                    className="px-5 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur rounded-2xl p-8 text-center shadow-lg">
              <div className="text-6xl mb-4">📡</div>
              <p className="text-gray-600 font-medium">Waiting for applicants...</p>
              <p className="text-sm text-gray-500 mt-2">You'll be notified when someone wants to connect</p>
            </div>
          )}
          
          <button
            onClick={() => setScreen('welcome')}
            className="w-full mt-4 bg-gray-200 hover:bg-gray-300 py-3 rounded-xl font-medium text-gray-700 transition-all"
          >
            Leave Ambassador Mode
          </button>
        </div>
      </div>
    );
  }

  // Pending Screen
  if (screen === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-6 animate-pulse">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Requesting...</h2>
          <p className="text-gray-600 mb-6">Waiting for them to accept</p>
          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-4xl mb-3">{selectedAmbassador?.emojis.join(' ')}</p>
            <p className="text-gray-700">{selectedAmbassador?.distance}m away</p>
          </div>
        </div>
      </div>
    );
  }

  // Connected Screen
  if (screen === 'connected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">They're Here! 🎉</h2>
          <p className="text-gray-600 mb-8">Connection established!</p>
          
          <div className="bg-gradient-to-r from-green-50 to-orange-50 rounded-2xl p-6 mb-6">
            <p className="text-5xl mb-3">{selectedAmbassador?.emojis.join(' ')}</p>
            <p className="text-gray-600">Look for these emojis!</p>
          </div>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              💬 Say "Hi, I saw your hand" to break the ice!
            </p>
          </div>
          
          {showStayInTouch && !stayInTouchRequested && (
            <button
              onClick={() => setStayInTouchRequested(true)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 rounded-xl mb-3 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Request to Stay in Touch
            </button>
          )}
          
          {stayInTouchRequested && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-3">
              <p className="text-sm text-green-800">
                ✓ Request sent! They can share their contact info if they want.
              </p>
            </div>
          )}
          
          <button
            onClick={() => setScreen('welcome')}
            className="w-full bg-gradient-to-r from-green-500 to-orange-500 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all"
          >
            Done! ✨
          </button>
        </div>
      </div>
    );
  }

  return null;
}