import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import { Thermometer, Sun, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

export default function App() {
  // State
  const [data, setData] = useState({
    suhu: 0,
    cahaya: 0,
    status: 'MENUNGGU', // AMAN, WASPADA, BAHAYA, MENUNGGU
    isConnected: false
  });

  // MQTT Connection Setup
  useEffect(() => {
    const client = mqtt.connect('wss://mqtt-dashboard.com:8884/mqtt');

    client.on('connect', () => {
      setData(prev => ({ ...prev, isConnected: true }));
      client.subscribe('firman/satpam_pintar/sensor');
    });

    client.on('message', (topic, payload) => {
      if (topic === 'firman/satpam_pintar/sensor') {
        try {
          const messageStr = payload.toString();
          const parsedData = JSON.parse(messageStr);
          
          setData(prev => ({
            ...prev,
            suhu: parsedData.suhu ?? prev.suhu,
            cahaya: parsedData.cahaya ?? prev.cahaya,
            status: parsedData.status ?? prev.status
          }));
        } catch (error) {
          console.error('Invalid JSON payload');
        }
      }
    });

    client.on('error', () => {
      setData(prev => ({ ...prev, isConnected: false }));
    });

    client.on('close', () => {
      setData(prev => ({ ...prev, isConnected: false }));
    });

    // Cleanup
    return () => {
      client.end();
    };
  }, []);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'AMAN':
        return 'text-emerald-400 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-500/10';
      case 'WASPADA':
        return 'text-amber-400 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-amber-500/10';
      case 'BAHAYA':
        return 'text-rose-500 border-rose-500/80 shadow-[0_0_40px_rgba(244,63,94,0.3)] bg-rose-500/10 animate-pulse';
      default:
        return 'text-slate-400 border-slate-500/50 shadow-none bg-slate-800/50';
    }
  };

  const StatusIcon = () => {
    switch (data.status) {
      case 'AMAN': return <ShieldCheck className="w-16 h-16 mb-4" />;
      case 'WASPADA': return <Shield className="w-16 h-16 mb-4" />;
      case 'BAHAYA': return <ShieldAlert className="w-16 h-16 mb-4" />;
      default: return <Shield className="w-16 h-16 mb-4" />;
    }
  };

  // Main Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-rose-500/30">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg">
          <h1 className="text-xl font-bold tracking-tight text-white/90">Monitor Satpam Pintar</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-slate-400">
              {data.isConnected ? 'TERHUBUNG' : 'TERPUTUS'}
            </span>
            <div className={`w-3 h-3 rounded-full ${data.isConnected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'}`} />
          </div>
        </header>

        {/* Main Status Card */}
        <div className={`flex flex-col items-center justify-center p-10 rounded-3xl border backdrop-blur-xl transition-all duration-500 ${getStatusStyles(data.status)}`}>
          <StatusIcon />
          <h2 className="text-5xl font-black tracking-wider drop-shadow-md">{data.status}</h2>
          <p className="text-sm mt-3 opacity-80 font-medium tracking-wide uppercase">Status Keamanan</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-lg hover:bg-white/10 transition-colors">
            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
              <Thermometer className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white drop-shadow-sm">{data.suhu}<span className="text-xl text-slate-400 ml-1 font-medium">°C</span></p>
              <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold">Suhu Ruangan</p>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-lg hover:bg-white/10 transition-colors">
            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400">
              <Sun className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white drop-shadow-sm">{data.cahaya}<span className="text-xl text-slate-400 ml-1 font-medium">Lux</span></p>
              <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold">Intensitas Cahaya</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
