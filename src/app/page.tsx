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
      <section className="relative z-10 pt-32 pb-20 px-4 max-w-7xl mx-auto text-center">
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
          Football Talent <br />
          <span className="text-gradient">Registration 2026</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12"
        >
          Unleash your potential on the field. Join the elite scholarship program designed for the next generation of football stars.
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

        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24"
        >
          {[
            { label: 'Scholarships', value: '50+' },
            { label: 'Pro Mentors', value: '12' },
            { label: 'Training Hours', value: '1500+' },
            { label: 'Placement Rate', value: '94%' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6">
              <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1">{stat.value}</div>
              <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative z-10 py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Program?</h2>
          <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Trophy className="w-8 h-8" />,
              title: "Performance Based Rewards",
              desc: "Full and partial scholarships based on trial performance and achievements."
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: "Elite Coaching",
              desc: "Learn from UEFA and AFC certified coaches with international experience."
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: "Career Path",
              desc: "Direct trials for professional clubs and national league teams."
            }
          ].map((benefit, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 hover:bg-white/10 transition-colors"
            >
              <div className="text-emerald-400 mb-6">{benefit.icon}</div>
              <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
              <p className="text-gray-400 leading-relaxed">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Eligibility Section */}
      <section id="eligibility" className="relative z-10 py-24 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Eligibility Criteria</h2>
            <p className="text-gray-400 mb-8 text-lg">
              We are looking for dedicated athletes who show exceptional promise both on and off the field.
            </p>
            <ul className="space-y-4">
              {[
                "Born between 2006 and 2012",
                "Proven record in School or District level tournaments",
                "Strong academic standing (Minimum 60%)",
                "Committed to professional training schedule",
                "Good conduct and sportsmanship record"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-2 aspect-square relative"
          >
             <div className="absolute inset-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-transparent flex items-center justify-center overflow-hidden">
                <Star className="w-32 h-32 text-emerald-500/20 animate-pulse" />
             </div>
             <div className="absolute bottom-10 left-10 glass-card p-6 max-w-[200px]">
                <div className="text-emerald-400 font-bold text-2xl mb-1">Join Now</div>
                <div className="text-gray-400 text-xs text-balance">Limited spots available for the 2026 intake.</div>
             </div>
          </motion.div>
        </div>
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
