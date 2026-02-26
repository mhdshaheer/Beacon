'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, Users, Shield, ArrowRight, Star, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <main className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid z-0" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full z-0" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full z-0" />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-block mb-6 px-4 py-1.5 glass-card text-emerald-400 font-medium text-sm tracking-wider uppercase"
        >
          Registration for 2026 Season Open
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
        >
          Empowering the <br />
          <span className="text-gradient">Future of Sports</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12"
        >
          A dedicated scholarship program designed to support athletes who show daily commitment and passion for their game.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link href="/register" className="btn-primary flex items-center gap-2 group">
            Apply Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="#about" className="glass-button px-8 py-3 rounded-xl font-semibold flex items-center gap-2">
            Learn More
          </Link>
        </motion.div>


      </section>

      {/* Who We Support Section */}
      <section id="support" className="relative z-10 py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16 px-4">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Who We Support</h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              The Beacon Scholarship proudly supports dedicated sportspersons who demonstrate consistency, discipline, and a strong commitment to daily practice.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              "Athletes born between 2002 and 2018",
              "Sportspersons who practice or train daily, regardless of their competitive level",
              "Players participating in local clubs, schools, academies, district, state, national, or professional platforms",
              "Individuals from any sport who show passion, determination, and strong potential",
              "Young athletes who may lack financial resources but are committed to improving their skills",
              "Students balancing academics along with serious sports training"
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex gap-4 items-start hover:bg-white/10 transition-colors border border-white/5"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeInUp} className="text-center max-w-4xl mx-auto border-t border-white/5 pt-12">
            <p className="text-gray-500 text-base md:text-lg italic leading-relaxed">
              We believe age is not a limitation — dedication is what truly matters. Whether at the beginning of their journey or already competing at higher levels, every committed athlete deserves support and recognition.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Philosophy Section */}
      <section className="relative z-10 py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] mb-4">Our Philosophy</h2>
          <h3 className="text-3xl md:text-5xl font-bold mb-8">Lighting the Path for Dedicated Athletes</h3>
          <p className="text-gray-400 text-lg max-w-4xl mx-auto leading-relaxed">
            True excellence is built on daily consistency. We focus on recognizing the silent effort of every athlete, providing the resources needed to overcome financial and systemic barriers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <Shield className="w-6 h-6" />,
              title: "Our Vision",
              desc: "To be a guiding light for hardworking athletes, ensuring that passion and talent are never limited by lack of resources."
            },
            {
              icon: <Users className="w-6 h-6" />,
              title: "Elite Mentorship",
              desc: "Gain access to professional coaching and career guidance to navigate your path from local grounds to national stages."
            },
            {
              icon: <Star className="w-6 h-6" />,
              title: "Holistic Purpose",
              desc: "We aim to reduce financial burdens, encourage academic balance, and foster a healthy, active sporting culture."
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 border border-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h4 className="text-xl font-bold mb-4">{item.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          {...fadeInUp}
          className="p-12 glass-card border-emerald-500/20 bg-emerald-500/5 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
          <h4 className="text-2xl font-bold mb-10 text-white">What Makes Us Different</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div>
              <div className="text-emerald-400 font-bold text-xl mb-2">Commitment over Fame</div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">We value your daily grind</p>
            </div>
            <div>
              <div className="text-emerald-400 font-bold text-xl mb-2">Hard Work over Popularity</div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Efficiency earns recognition</p>
            </div>
            <div>
              <div className="text-emerald-400 font-bold text-xl mb-2">Effort over Status</div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Potential is our priority</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Footer */}
      <footer className="relative z-10 pb-10 pt-20 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div>
            <div className="text-2xl font-bold text-gradient mb-2">Beacon Scholarship</div>
            <p className="text-gray-500 max-w-sm text-sm">
              Empowering talented athletes through education and elite sports training since 2018.
            </p>
          </div>
          <div className="flex gap-10">
            <div className="space-y-2">
              <div className="text-white font-semibold">Contact</div>
              <div className="text-gray-500 text-sm">support@beaconscholarship.com</div>
              <div className="text-gray-500 text-sm">+91 98765 43210</div>
            </div>
            <div className="space-y-2 text-right md:text-left">
              <div className="text-white font-semibold">Location</div>
              <div className="text-gray-500 text-sm text-balance">Elite Sports Complex, Bangalore, India</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
          © 2026 Beacon Scholarship Program. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
