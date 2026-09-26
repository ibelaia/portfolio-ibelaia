'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  FileText, 
  ArrowRight, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Send, 
  Code, 
  Briefcase, 
  Camera, 
  Globe 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const ContactSection: React.FC = () => {
  const { t } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('Thank you! Your message has been sent.', 'Terima kasih! Pesan Anda telah terkirim.'));
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-16 sm:space-y-24">
      
      {/* ================= SEGMEN 1: LET'S BUILD SOMETHING MEANINGFUL ================= */}
      <section className="w-full">
        {/* Kontainer Mobile */}
        <div className="md:hidden bg-[#090e1e]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <User size={22} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 font-medium mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            {t("LET'S CONNECT", "MARI TERHUBUNG")}
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug mb-3">
            {t("Let's Build Something Meaningful.", 'Mari Bangun Sesuatu yang Bermakna.')}
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed mb-6 font-normal">
            {t(
              "I'm always open to learning, collaborating, and building useful digital experiences. If you have an idea, project, or opportunity, let's talk.",
              'Saya selalu terbuka untuk belajar, berkolaborasi, dan membangun pengalaman digital yang bermanfaat. Mari berdiskusi jika Anda memiliki ide atau proyek.'
            )}
          </p>

          <div className="flex flex-col gap-2.5 w-full mb-6">
            <a
              href="#contact-form"
              className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>{t('Get in Touch', 'Hubungi Sekarang')}</span>
              <ArrowRight size={13} />
            </a>
            <Link
              href="/projects"
              className="w-full py-2.5 rounded-xl bg-[#1e1b4b]/70 hover:bg-[#1e1b4b] border border-purple-500/30 text-purple-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>{t('View My Projects', 'Lihat Proyek Saya')}</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/5 w-full text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Mail size={12} className="text-cyan-400" /> hello@ibelaia.dev
            </span>
            <span>|</span>
            <a href="/assets/resume.pdf" target="_blank" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <FileText size={12} className="text-purple-400" /> {t('View Resume', 'Lihat Resume')}
            </a>
          </div>
        </div>

        {/* Kontainer Desktop */}
        <div className="hidden md:grid md:grid-cols-12 gap-10 items-center">
          <div className="col-span-6 space-y-6">
            <div className="w-11 h-11 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400">
              <User size={20} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              {t("LET'S CONNECT", "MARI TERHUBUNG")}
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {t("Let's Build Something Meaningful.", 'Mari Bangun Sesuatu yang Bermakna.')}
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-lg font-normal">
              {t(
                "I'm always open to learning, collaborating, and building useful digital experiences. If you have an idea, project, or opportunity, let's talk.",
                'Saya selalu terbuka untuk belajar, berkolaborasi, dan membangun pengalaman digital yang bermanfaat. Mari berdiskusi jika Anda memiliki ide atau proyek.'
              )}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="#contact-form"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
              >
                <span>{t('Get in Touch', 'Hubungi Sekarang')}</span>
                <ArrowRight size={14} />
              </a>
              <Link
                href="/projects"
                className="px-5 py-2.5 rounded-xl bg-[#090e1e] hover:bg-white/5 border border-white/10 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-all"
              >
                <span>{t('View My Projects', 'Lihat Proyek Saya')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-2">
                <Mail size={14} className="text-cyan-400" /> hello@ibelaia.dev
              </span>
              <a href="/assets/resume.pdf" target="_blank" className="flex items-center gap-2 hover:text-white transition-colors">
                <FileText size={14} className="text-purple-400" /> {t('View Resume', 'Lihat Resume')}
              </a>
            </div>
          </div>

          <div className="col-span-6">
            <div className="bg-[#090e1f]/80 border border-white/10 rounded-2xl p-3 shadow-2xl backdrop-blur-xl">
              <div className="relative rounded-xl overflow-hidden border border-white/5 bg-slate-950">
                <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Connect — <span className="text-cyan-400">Desktop</span></span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80"
                  alt="Connect Visual"
                  className="w-full h-72 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEGMEN 2: LET'S WORK TOGETHER (FORM & CHANNELS) ================= */}
      <section id="contact-form" className="w-full pt-6">
        <div className="flex items-center gap-2 text-cyan-400 text-[11px] font-mono font-medium mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>{t('GET IN TOUCH', 'HUBUNGI SAYA')}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <MessageSquare size={18} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t("Let's", 'Mari')} <span className="text-cyan-400">{t('Work Together.', 'Bekerja Sama.')}</span>
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-xl">
          {t(
            "Have a project in mind or want to collaborate? I'd love to hear from you. Let's create something amazing together!",
            'Punya ide proyek atau ingin berkolaborasi? Saya siap mendengarkannya. Mari ciptakan karya hebat bersama!'
          )}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Formulir Pesan */}
          <div className="lg:col-span-6 bg-[#090e1e]/80 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1.5">
                  {t('Your Name', 'Nama Lengkap')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('John Doe', 'Nama Anda')}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <User size={14} className="absolute left-3 top-3 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1.5">
                  {t('Your Email', 'Alamat Email')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1.5">
                  {t('Subject', 'Subjek Pesan')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t('Project Collaboration Inquiry', 'Diskusi Proyek Kolaborasi')}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <MessageSquare size={14} className="absolute left-3 top-3 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1.5">
                  {t('Your Message', 'Isi Pesan')}
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t('Tell me about your goals or questions...', 'Ceritakan rencana atau kebutuhan proyek Anda...')}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                  />
                  <FileText size={14} className="absolute left-3 top-3 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#b6b2ff] to-cyan-400 hover:opacity-95 text-[#0a0d20] font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>{t('Send Message', 'Kirim Pesan')}</span>
                <Send size={13} />
              </button>
            </form>
          </div>

          {/* Kolom Informasi Kontak Langsung & Social */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-mono text-slate-400 block tracking-wider">
              • {t('Contact Info', 'Informasi Kontak')}
            </span>

            {/* Grid 4 Kotak Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Box Email */}
              <div className="bg-[#090e1e]/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 mb-3">
                  <Mail size={15} />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Email</span>
                  <a href="mailto:hello@ibelaia.dev" className="text-xs font-semibold text-cyan-400 hover:underline">
                    hello@ibelaia.dev
                  </a>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{t('Drop me a message', 'Kirimkan saya pesan')}</p>
                </div>
              </div>

              {/* Box WhatsApp 1 */}
              <div className="bg-[#090e1e]/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 mb-3">
                  <Phone size={15} />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">WhatsApp</span>
                  <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-400 hover:underline">
                    +62 812 3456 7890
                  </a>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{t("Let's chat", 'Mari mengobrol')}</p>
                </div>
              </div>

              {/* Box Location */}
              <div className="bg-[#090e1e]/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 mb-3">
                  <MapPin size={15} />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">{t('Location', 'Lokasi')}</span>
                  <span className="text-xs font-semibold text-cyan-400">Indonesia</span>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">GMT +7</p>
                </div>
              </div>

              {/* Box WhatsApp 2 */}
              <div className="bg-[#090e1e]/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 mb-3">
                  <Phone size={15} />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">WhatsApp</span>
                  <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-400 hover:underline">
                    +62 812 3456 7890
                  </a>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{t("Let's chat", 'Mari mengobrol')}</p>
                </div>
              </div>
            </div>

            {/* Divider Or Reach Me Directly */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] font-mono text-cyan-400 tracking-wider">
                • {t('OR REACH ME DIRECTLY', 'ATAU HUBUNGI LANGSUNG')} •
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Panel Let's Connect Social */}
            <div className="bg-[#090e1e]/80 border border-white/10 rounded-2xl p-5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-3">
                • {t("LET'S CONNECT", "MARI TERHUBUNG")} •
              </span>
              <div className="grid grid-cols-4 gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 hover:text-white transition-all text-slate-300"
                >
                  <Code size={16} />
                  <span className="text-[10px] font-mono">GitHub</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 hover:text-white transition-all text-slate-300"
                >
                  <Briefcase size={16} />
                  <span className="text-[10px] font-mono">LinkedIn</span>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 hover:text-white transition-all text-slate-300"
                >
                  <Camera size={16} />
                  <span className="text-[10px] font-mono">Instagram</span>
                </a>
                <a
                  href="https://dribbble.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 hover:text-white transition-all text-slate-300"
                >
                  <Globe size={16} />
                  <span className="text-[10px] font-mono">Dribbble</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactSection;