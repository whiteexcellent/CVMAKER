"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, ArrowRight, Play, CheckCircle2, TrendingUp, Users, Shield } from 'lucide-react';

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const generateParticles = (count: number): FloatingParticle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));
};

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles] = useState(() => generateParticles(30));
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
      return () => heroElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-float {
          animation: float var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.6s ease-out forwards;
        }
      `}</style>

      {/* Animated Background Grid */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-blue-400/30 blur-sm animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              '--duration': `${particle.duration}s`,
              '--delay': `${particle.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-600/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/20 to-emerald-600/20 rounded-full blur-3xl" />

      {/* Mouse Follow Glow */}
      <div
        className="absolute pointer-events-none z-10 transition-opacity duration-300"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          width: '400px',
          height: '400px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Glassmorphic Navigation */}
      <nav className="relative z-50 mx-auto max-w-7xl px-6 pt-6">
        <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 shadow-2xl transition-all duration-700 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">OmniCV</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#about" className="text-sm text-white/80 hover:text-white transition-colors">About</a>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login" className="hidden sm:block text-sm text-white/90 hover:text-white transition-colors">
                Sign In
              </Link>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-500/50 transition-all duration-300 hover:scale-105">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-32 md:pb-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className={`inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 transition-all duration-700 delay-100 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}>
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">Powered by Claude 3.5 Sonnet</span>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          </div>

          {/* Main Heading */}
          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight transition-all duration-700 delay-200 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            Attention-Grabbing.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              Flawlessly Simple.
            </span>
          </h1>

          {/* Subheading */}
          <p className={`text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-300 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            Engineered by Omni AI. We transform your raw experience into mathematically optimized resumes designed to bypass ATS systems and impress human recruiters instantly.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 transition-all duration-700 delay-400 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <Button
              size="lg"
              asChild
              className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg px-10 py-7 rounded-2xl shadow-2xl shadow-blue-500/50 border-0 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/70"
            >
              <Link href="/signup">
                Generate Free CV
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="group bg-white/10 hover:text-white backdrop-blur-md border-2 border-white/30 text-white text-lg px-10 py-7 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <Link href="/login">
                <Play className="mr-2 w-5 h-5 fill-white" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className={`flex flex-wrap items-center justify-center gap-8 pt-12 transition-all duration-700 delay-500 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-white/80">No credit card required</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/20" />
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-white/80">Free Signup Bonus</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/20" />
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-white/80">ATS Optimized</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-16 transition-all duration-700 delay-600 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}>
            {[
              { icon: Users, value: '10x', label: 'More Interviews', color: 'from-blue-500 to-cyan-500' },
              { icon: TrendingUp, value: '2 mins', label: 'To Generate', color: 'from-cyan-500 to-blue-500' },
              { icon: Shield, value: '100%', label: 'Data Privacy', color: 'from-emerald-500 to-teal-500' },
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-white/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300 ${stat.color}`}
                />
                <div className="relative z-10">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-10" />
    </div>
  );
}
