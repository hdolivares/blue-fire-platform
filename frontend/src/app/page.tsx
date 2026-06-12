'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LottieAnimation } from '@/components/LottieAnimation';
import { AnimatedGradient } from '@/components/AnimatedGradient';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useScrolled } from '@/hooks/useScrolled';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('Operator');
  const scrolled = useScrolled();

  // Smooth scrolling for anchor links
  const scrollToSection = (sectionId: string) => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Intersection Observer for fade-in animations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target) {
          entry.target.classList.add('show');
        }
      });
    });

    const hiddenElements = document.querySelectorAll('section');
    hiddenElements.forEach((el) => {
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="app-header fixed w-full p-4 z-50" data-scrolled={scrolled}>
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center text-2xl font-bold">
            <div className="w-11 h-11 gradient-brand rounded-xl flex items-center justify-center mr-3 text-on-brand font-bold text-lg shadow-md">
              BF
            </div>
            <span className="gradient-brand-text">Blue Fire</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="primary" size="md">
                Launch App
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero min-h-screen flex flex-col justify-center items-center text-center px-5 relative overflow-hidden">
        <AnimatedGradient />
        {/* Scrim keeps hero text legible over the animated gradient in both themes */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40 pointer-events-none" />
        <div className="hero-content z-10">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 text-on-brand drop-shadow-lg">
            The Sky is an Ocean.
          </h1>
          <p className="text-xl md:text-2xl text-white/85 mb-8 max-w-2xl mx-auto drop-shadow">
            We've learned how to harvest it. Pure water from pure air.
          </p>
          <Button
            variant="accent"
            size="lg"
            onClick={() => scrollToSection('solution')}
          >
            Discover How ▼
          </Button>
        </div>
        <div className="hero-animation absolute bottom-[-10%] left-1/2 transform -translate-x-1/2 w-full max-w-4xl z-0 opacity-40">
          <LottieAnimation 
            src="/Loading.lottie"
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="solution gradient-brand py-24 px-5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-on-brand">
            We Close the Loop. We Create Value.
          </h2>
          <p className="max-w-2xl mx-auto mb-12 text-white/85 text-lg">
            Our #2Green2bBlue model turns inefficient energy use into a source of pure water and profit.
          </p>

          <div className="solution-steps-container grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            <div className="solution-step bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-2xl">
              <div className="icon-wrapper text-4xl mb-4">🏨</div>
              <h3 className="text-xl font-bold mb-4 text-on-brand">1. The Anchor Client</h3>
              <p className="text-white/80">
                It starts with a partner—a hotel, hospital, or factory—with high energy costs. No CAPEX for them.
              </p>
            </div>
            <div className="solution-step bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-2xl">
              <div className="icon-wrapper text-4xl mb-4">🔥❄️💧</div>
              <h3 className="text-xl font-bold mb-4 text-on-brand">2. The Valuable Outputs</h3>
              <p className="text-white/80">
                The system generates thermal energy byproducts, slashing heating and cooling bills, making the water a "zero cost" resource.
              </p>
            </div>
            <div className="solution-step bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-2xl">
              <div className="icon-wrapper text-4xl mb-4">👩‍💼💰</div>
              <h3 className="text-xl font-bold mb-4 text-on-brand">3. The Opportunity</h3>
              <p className="text-white/80">
                This "Zero-Cost Water" creates a new, high-margin market, managed by local operators and funded by savvy investors.
              </p>
            </div>
          </div>

          <div className="solution-process mt-12">
            <div className="w-full max-w-xs mx-auto mb-4">
              <LottieAnimation
                src="/WaterMorph.lottie"
                loop={true}
                autoplay={true}
                style={{ width: '100%', maxWidth: '300px', margin: 'auto' }}
              />
            </div>
            <div className="solution-input flex items-center justify-center flex-col">
              <div className="icon-wrapper text-3xl mb-2">⚡️🌬️</div>
              <p className="text-white/80">Electricity & Humid Air In</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles gradient-brand py-24 px-5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-on-brand">
            Find Your Fire.
          </h2>

          <div className="role-tabs mb-8 inline-flex border border-white/20 rounded-xl overflow-hidden">
            {['Operator', 'Investor', 'Both'].map((role) => (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                className={`px-6 py-4 cursor-pointer border-none font-semibold transition-all duration-300 ${
                  activeTab === role ? 'text-on-brand bg-white/15' : 'text-white/70 hover:text-on-brand'
                }`}
              >
                {role === 'Operator' && '👩‍💼 Become an Operator'}
                {role === 'Investor' && '💰 Become an Investor'}
                {role === 'Both' && '👩‍💼+💰 Own the Full Cycle'}
              </button>
            ))}
          </div>

          <div 
            id="Operator" 
            className={`tab-content ${activeTab === 'Operator' ? 'active' : ''}`}
            style={{ display: activeTab === 'Operator' ? 'block' : 'none' }}
          >
            <h3 className="text-2xl font-bold mb-4 text-accent">Own the Flow.</h3>
            <p className="text-white/80 mb-8">
              As an "Alice," you manage the water produced by a Blue Fire unit. You build a brand, develop a customer base, and sell high-margin, pure water to your community. We provide the tools; you provide the entrepreneurial spark.
            </p>
            <Link href="/register">
              <Button variant="primary" size="md">
                Start Your Water Business
              </Button>
            </Link>
          </div>

          <div 
            id="Investor" 
            className={`tab-content ${activeTab === 'Investor' ? 'active' : ''}`}
            style={{ display: activeTab === 'Investor' ? 'block' : 'none' }}
          >
            <h3 className="text-2xl font-bold mb-4 text-accent">Own the Engine.</h3>
            <p className="text-white/80 mb-8">
              Provide capital for the SEAS hardware, the asset at the heart of the system. Earn a predictable, asset-backed return from the profitable sale of water, all managed through transparent smart contracts on the blockchain.
            </p>
            <Link href="/register">
              <Button variant="primary" size="md">
                Invest in an Asset
              </Button>
            </Link>
          </div>

          <div 
            id="Both" 
            className={`tab-content ${activeTab === 'Both' ? 'active' : ''}`}
            style={{ display: activeTab === 'Both' ? 'block' : 'none' }}
          >
            <h3 className="text-2xl font-bold mb-4 text-accent">Own the Revolution.</h3>
            <p className="text-white/80 mb-8">
              For those ready to lead the charge. Fund the machine and manage the water sales yourself to maximize your control and returns in this decentralized utility model.
            </p>
            <Link href="/register">
              <Button variant="primary" size="md">
                Build Your Utility
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology gradient-brand py-24 px-5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-on-brand">
            The Powerhouse Behind the Water
          </h2>
          
          <div className="machine-showcase grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'AWA MODULA 250',
                image: '/AWA-250-1024x512.jpg',
                specs: [
                  { icon: '💧', label: 'Water Production:', value: 'Up to 2,500 Liters/Day' },
                  { icon: '🔥', label: 'Hot Water Output:', value: 'Heats 2,000 Liters/Hour' },
                  { icon: '❄️', label: 'Cool Air Output:', value: '8,000 m³/hour of fresh air' },
                  { icon: '👥', label: 'Ideal Client:', value: 'Large hotels, residential complexes, small industrial facilities.' }
                ]
              },
              {
                name: 'AWA MODULA 500',
                image: '/AWA-500-1024x512.jpg',
                specs: [
                  { icon: '💧', label: 'Water Production:', value: 'Up to 5,000 Liters/Day' },
                  { icon: '🔥', label: 'Hot Water Output:', value: 'Heats 4,000 Liters/Hour' },
                  { icon: '❄️', label: 'Cool Air Output:', value: '16,000 m³/hour of fresh air' },
                  { icon: '👥', label: 'Ideal Client:', value: 'Hospitals, large resorts, data centers, manufacturing plants.' }
                ]
              },
              {
                name: 'AWA MODULA 1000',
                image: '/AWA-1000-1024x512.jpg',
                specs: [
                  { icon: '💧', label: 'Water Production:', value: 'Up to 10,000 Liters/Day' },
                  { icon: '🔥', label: 'Hot Water Output:', value: 'Heats 8,000 Liters/Hour' },
                  { icon: '❄️', label: 'Cool Air Output:', value: '32,000 m³/hour of fresh air' },
                  { icon: '👥', label: 'Ideal Client:', value: 'Industrial parks, bottling plants, remote work communities.' }
                ]
              }
            ].map((machine, index) => (
              <div key={index} className="machine-card bg-white/10 backdrop-blur-xl p-8 rounded-2xl text-left border border-white/20 shadow-2xl">
                <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden">
                  <Image
                    src={machine.image}
                    alt={machine.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-4 text-accent">{machine.name}</h3>
                <ul className="space-y-3">
                  {machine.specs.map((spec, specIndex) => (
                    <li key={specIndex} className="text-white/80">
                      <strong>{spec.icon} {spec.label}</strong> {spec.value}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="proof gradient-brand py-24 px-5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-on-brand">
            Already Making Waves.
          </h2>
          
          <div className="case-study-card bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden max-w-5xl mx-auto text-left flex flex-col md:flex-row border border-white/20 shadow-2xl">
            <div className="case-study-image md:w-2/5">
              <div className="relative w-full h-80">
                <Image
                  src="/piscina-viva-villahermosa.webp"
                  alt="Hotel in Villahermosa"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="case-study-content md:w-3/5 p-8 md:p-12">
              <h3 className="text-2xl font-bold mb-4 text-accent">
                Case Study: Hotel in Villahermosa, Mexico
              </h3>
              <p className="text-white/80 mb-8">
                An integration with an older generation AWA 250 proved the model's power, delivering massive energy savings and creating a new resource stream for the hotel.
              </p>
              <div className="case-study-stats flex flex-col md:flex-row gap-6">
                {[
                  { icon: '💧', value: '~1,600 L/Day', label: 'High-quality drinking water produced.' },
                  { icon: '⛽️', value: '210 L/Day', label: 'LPG fuel saved by eliminating the old boiler.' },
                  { icon: '💰', value: '$72,440', label: 'Net annual savings for the client.' }
                ].map((stat, index) => (
                  <div key={index} className="stat text-center flex-1">
                    <span className="stat-icon text-3xl block mb-2">{stat.icon}</span>
                    <strong className="text-xl text-on-brand block mb-1">{stat.value}</strong>
                    <span className="text-sm text-white/80">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta gradient-brand py-24 px-5 text-on-brand">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-on-brand">
            The Future of Water is in the Air.
          </h2>
          <p className="text-xl mb-8 text-white/85">
            Ready to join the revolution? Register on our platform to begin your journey as an operator or investor.
          </p>
          <Link href="/register">
            <Button variant="accent" size="lg" className="text-lg">
              Launch the App & Register
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 border-t border-border text-center text-text-secondary">
        <p>&copy; 2025 Blue Fire. All Rights Reserved.</p>
        <div className="contact-info mt-2">
          <span>jt@bluefire.love</span> | <span>lgg@seas-sa.com</span>
        </div>
      </footer>
    </div>
  );
}
