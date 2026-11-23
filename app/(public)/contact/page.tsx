'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  ArrowLeft,
  ArrowUpRight,
  Code2,
  Briefcase,
  Camera,
  SendHorizontal,
  Sparkles,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const dynamic = 'force-dynamic';

const CONTACT_SYNC_CHANNEL = 'portfolio-sync-contact';

const DEFAULT_TERMINAL_IMAGE =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80';

const INITIAL_CONTACT_INFO = {
  badge_text: 'GET IN TOUCH',
  badge_text_id: 'HUBUNGI SAYA',
  title: "Let's Build Something Meaningful.",
  title_id: 'Mari Membangun Sesuatu yang Bermakna.',
  subtitle:
    "I'm always open to discussing web engineering projects, partnership opportunities, or technical inquiries. Have an idea, project, or role in mind? Let's talk.",
  subtitle_id:
    'Saya selalu terbuka untuk berdiskusi mengenai proyek rekayasa web, peluang kemitraan, maupun pertanyaan teknis. Punya ide atau proyek? Mari ngobrol.',
  email: 'hello@ibelaia.dev',
  phone: '+62 812 3456 7890',
  location: 'Surabaya, Indonesia',
  location_id: 'Surabaya, Indonesia',
  response_time: '< 24 Business Hours',
  response_time_id: '< 24 Jam Kerja',
  terminal_image: DEFAULT_TERMINAL_IMAGE,
  github_url: 'https://github.com/ibelaia',
  linkedin_url: 'https://linkedin.com',
  instagram_url: 'https://instagram.com',
  telegram_url: 'https://t.me',
};

const INITIAL_FORM_DATA = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

function isIndonesianLocale(lang: unknown): boolean {
  if (!lang) return false;
  const normalized = String(lang).trim().toLowerCase();
  return (
    normalized === 'id' ||
    normalized === 'ind' ||
    normalized === 'indonesia' ||
    normalized.startsWith('id-') ||
    normalized.startsWith('id_')
  );
}

export default function ContactPage() {
  const appContext = useApp() as any;
  const t =
    typeof appContext?.t === 'function'
      ? appContext.t
      : (en: string, id: string) =>
          isIndonesianLocale(appContext?.lang) ? id : en;

  const isId = useMemo(() => {
    const rawLang =
      appContext?.lang ??
      appContext?.locale ??
      appContext?.language ??
      (typeof t('EN_CHECK', 'ID_CHECK') === 'string' &&
      t('EN_CHECK', 'ID_CHECK') === 'ID_CHECK'
        ? 'id'
        : 'en');
    return isIndonesianLocale(rawLang);
  }, [appContext, t]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [terminalImageFailed, setTerminalImageFailed] = useState(false);

  const [contactInfo, setContactInfo] = useState(INITIAL_CONTACT_INFO);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const fetchNeonContactData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [contactRes, settingsRes] = await Promise.allSettled([
        fetch(`/api/contact?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' }),
      ]);

      let contactJson: any = null;
      if (contactRes.status === 'fulfilled') {
        const rawText = await contactRes.value.text();
        try {
          contactJson = rawText ? JSON.parse(rawText) : null;
        } catch {
          contactJson = null;
        }
      }

      let settingsData: any = null;
      if (settingsRes.status === 'fulfilled') {
        const rawSettingsText = await settingsRes.value.text();
        try {
          const settingsJson = rawSettingsText
            ? JSON.parse(rawSettingsText)
            : null;
          if (settingsJson?.success && settingsJson?.data) {
            settingsData = settingsJson.data;
          }
        } catch {
          settingsData = null;
        }
      }

      const content = contactJson?.content || null;

      setTerminalImageFailed(false);
      setContactInfo((prev) => ({
        badge_text:
          content?.badge_text ||
          settingsData?.contact_badge ||
          prev.badge_text,
        badge_text_id:
          content?.badge_text_id ||
          settingsData?.contact_badge_id ||
          prev.badge_text_id,
        title:
          content?.title || settingsData?.contact_title || prev.title,
        title_id:
          content?.title_id ||
          settingsData?.contact_title_id ||
          prev.title_id,
        subtitle:
          content?.subtitle ||
          settingsData?.contact_subtitle ||
          settingsData?.site_tagline ||
          prev.subtitle,
        subtitle_id:
          content?.subtitle_id ||
          settingsData?.contact_subtitle_id ||
          prev.subtitle_id,
        email:
          content?.email ||
          settingsData?.contact_email ||
          settingsData?.email ||
          prev.email,
        phone:
          content?.phone ||
          settingsData?.contact_phone ||
          settingsData?.phone ||
          prev.phone,
        location:
          content?.location || settingsData?.location || prev.location,
        location_id:
          content?.location_id ||
          settingsData?.location_id ||
          content?.location ||
          prev.location_id,
        response_time:
          content?.response_time ||
          settingsData?.response_time ||
          prev.response_time,
        response_time_id:
          content?.response_time_id ||
          settingsData?.response_time_id ||
          prev.response_time_id,
        terminal_image:
          content?.terminal_image ||
          settingsData?.contact_image_url ||
          prev.terminal_image ||
          DEFAULT_TERMINAL_IMAGE,
        github_url: settingsData?.github_url || prev.github_url,
        linkedin_url: settingsData?.linkedin_url || prev.linkedin_url,
        instagram_url: settingsData?.instagram_url || prev.instagram_url,
        telegram_url: settingsData?.telegram_url || prev.telegram_url,
      }));
    } catch (err) {
      console.warn('Gagal memuat contact content dari Neon API:', err);
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchNeonContactData(true).finally(() => {
      if (isMounted) setLoading(false);
    });

    const handleSyncEvent = () => {
      if (!isMounted) return;
      fetchNeonContactData(false);
    };

    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel(CONTACT_SYNC_CHANNEL);
      channel.onmessage = handleSyncEvent;
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CONTACT_SYNC_CHANNEL) {
        handleSyncEvent();
      }
    };

    window.addEventListener(CONTACT_SYNC_CHANNEL, handleSyncEvent);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleSyncEvent);

    return () => {
      isMounted = false;
      if (channel) {
        channel.close();
      }
      window.removeEventListener(CONTACT_SYNC_CHANNEL, handleSyncEvent);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleSyncEvent);
    };
  }, [fetchNeonContactData]);

  const broadcastNewMessageToInbox = (newMsgData: any) => {
    const eventDetail = {
      section: 'contact',
      action: 'new_message',
      updatedAt: Date.now(),
      data: newMsgData,
    };

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel(CONTACT_SYNC_CHANNEL);
        ch.postMessage(eventDetail);
        ch.close();
      }
    } catch {
      // Abaikan jika BroadcastChannel tidak tersedia
    }

    try {
      localStorage.setItem(CONTACT_SYNC_CHANNEL, JSON.stringify(eventDetail));
    } catch {
      // Abaikan jika localStorage diblokir
    }

    window.dispatchEvent(
      new CustomEvent(CONTACT_SYNC_CHANNEL, { detail: eventDetail })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(formData),
      });
      const rawText = await response.text();
      let json: any = null;
      try {
        json = rawText ? JSON.parse(rawText) : null;
      } catch {
        json = null;
      }

      if (response.ok && json?.success) {
        broadcastNewMessageToInbox(json.data ?? formData);
        setSubmitted(true);
        setFormData(INITIAL_FORM_DATA);
      } else {
        throw new Error(
          json?.error || 'Terjadi kesalahan saat mengirim pesan.'
        );
      }
    } catch (err: any) {
      console.warn('Error submitting message:', err);
      setSubmitError(err?.message || 'Terjadi kesalahan saat mengirim pesan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-accent" />
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {t(
            'Loading contact page from Neon API...',
            'Memuat halaman kontak dari Neon API...'
          )}
        </span>
      </main>
    );
  }

  const displayBadge =
    isId && contactInfo.badge_text_id?.trim()
      ? contactInfo.badge_text_id.trim()
      : contactInfo.badge_text;

  const displayTitle =
    isId && contactInfo.title_id?.trim()
      ? contactInfo.title_id.trim()
      : contactInfo.title;

  const displaySubtitle =
    isId && contactInfo.subtitle_id?.trim()
      ? contactInfo.subtitle_id.trim()
      : contactInfo.subtitle;

  const displayLocation =
    isId && contactInfo.location_id?.trim()
      ? contactInfo.location_id.trim()
      : contactInfo.location;

  const displayResponseTime =
    isId && contactInfo.response_time_id?.trim()
      ? contactInfo.response_time_id.trim()
      : contactInfo.response_time;

  const activeTerminalImage = terminalImageFailed
    ? DEFAULT_TERMINAL_IMAGE
    : contactInfo.terminal_image || DEFAULT_TERMINAL_IMAGE;

  const socialLinks = [
    {
      href: contactInfo.github_url,
      label: 'GitHub',
      icon: <Code2 size={15} />,
    },
    {
      href: contactInfo.linkedin_url,
      label: 'LinkedIn',
      icon: <Briefcase size={15} />,
    },
    {
      href: contactInfo.instagram_url,
      label: 'Instagram',
      icon: <Camera size={15} />,
    },
    {
      href: contactInfo.telegram_url,
      label: 'Telegram',
      icon: <SendHorizontal size={15} />,
    },
  ];

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Tombol Back to Home */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors group"
        >
          <ArrowLeft
            size={13}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>{t('Back to Home', 'Kembali ke Beranda')}</span>
        </Link>
      </div>

      {/* Hero Bagian Atas: Teks + Terminal Board Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-10 pb-8 border-b border-[var(--card-border)]">
        <div className="lg:col-span-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-mono text-accent mb-3">
            <Sparkles size={12} />
            <span>{displayBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-main)] tracking-tight leading-tight mb-4">
            {displayTitle}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6 max-w-lg">
            {displaySubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#contact-form"
              className="px-4 py-2.5 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-accent/20 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>{t('Get In Touch', 'Kirim Pesan')}</span>
              <Send size={13} />
            </a>
            <Link
              href="/projects"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--card-border)] text-[var(--text-main)] text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <span>{t('View My Projects', 'Lihat Proyek')}</span>
              <ArrowUpRight size={13} className="text-[var(--text-muted)]" />
            </Link>
          </div>
        </div>

        {/* Gambar / Visual Board */}
        <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl relative">
          <div className="px-4 py-2.5 bg-[var(--bg-primary)] border-b border-[var(--card-border)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
            <span>TERMINAL &mdash; READY</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
          </div>
          <div className="h-56 sm:h-64 w-full relative overflow-hidden">
            <img
              src={activeTerminalImage}
              alt="Circuit Board Engineering"
              className="w-full h-full object-cover opacity-80"
              onError={() => setTerminalImageFailed(true)}
            />
          </div>
        </div>
      </div>

      {/* Bagian Bawah: Form Kontak & Kontak Detail Card */}
      <div id="contact-form" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Formulir Kontak */}
        <div className="lg:col-span-7 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 sm:p-7 backdrop-blur-xl shadow-xl transition-colors duration-250">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-sm bg-accent" />
            <span className="text-[11px] font-mono text-accent uppercase tracking-wider">
              {t('GET IN TOUCH', 'FORMULIR KONTAK')}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] mb-2">
            {t("Let's Work Together.", 'Mari Berkolaborasi.')}
          </h2>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">
            {t(
              'Have a project in mind or want to collaborate? I’d love to hear from you. Let’s create something amazing together!',
              'Punya ide proyek atau ingin bekerja sama? Kirimkan pesan melalui formulir di bawah ini.'
            )}
          </p>

          {submitted ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                {t('Message Sent Successfully!', 'Pesan Berhasil Dikirim!')}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {t(
                  "Thank you for reaching out. I'll get back to you as soon as possible.",
                  'Terima kasih telah menghubungi. Saya akan membalas secepat mungkin.'
                )}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setSubmitError(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-[var(--card-border)] text-xs font-semibold text-[var(--text-main)] transition-colors cursor-pointer"
              >
                {t('Send Another Message', 'Kirim Pesan Lain')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1.5">
                  {t('YOUR NAME', 'NAMA LENGKAP')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--card-border)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent transition-colors shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1.5">
                  {t('YOUR EMAIL', 'ALAMAT EMAIL')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--card-border)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent transition-colors shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1.5">
                  {t('SUBJECT', 'SUBJEK')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder={t(
                    'Project Collaboration / Inquiry',
                    'Kolaborasi Proyek / Pertanyaan'
                  )}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--card-border)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent transition-colors shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[var(--text-muted)] mb-1.5">
                  {t('YOUR MESSAGE', 'PESAN ANDA')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder={t(
                    'Tell me about your project, timeline, or idea...',
                    'Ceritakan detail proyek atau pertanyaan Anda...'
                  )}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--card-border)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent transition-colors resize-none shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                <span>
                  {isSubmitting
                    ? t('Sending...', 'Mengirim...')
                    : t('Send Message 🚀', 'Kirim Pesan 🚀')}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* Kolom Kanan: 4 Kotak Info Kontak & Social Bar */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            {/* Email Box */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-accent/30 rounded-xl p-3 sm:p-4 backdrop-blur-xl flex flex-col justify-between transition-colors">
              <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-2">
                <Mail size={13} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block leading-tight">
                  Email
                </span>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-[11px] sm:text-xs font-semibold text-[var(--text-main)] hover:text-accent transition-colors mt-0.5 block truncate"
                >
                  {contactInfo.email}
                </a>
              </div>
            </div>

            {/* Phone Box */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-emerald-400/30 rounded-xl p-3 sm:p-4 backdrop-blur-xl flex flex-col justify-between transition-colors">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                <Phone size={13} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block leading-tight">
                  Phone
                </span>
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="text-[11px] sm:text-xs font-semibold text-[var(--text-main)] hover:text-emerald-400 transition-colors mt-0.5 block truncate"
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>

            {/* Location Box */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-purple-400/30 rounded-xl p-3 sm:p-4 backdrop-blur-xl flex flex-col justify-between transition-colors">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                <MapPin size={13} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block leading-tight">
                  {t('Location', 'Lokasi')}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-[var(--text-main)] mt-0.5 block truncate">
                  {displayLocation}
                </span>
              </div>
            </div>

            {/* Availability Box */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-amber-400/30 rounded-xl p-3 sm:p-4 backdrop-blur-xl flex flex-col justify-between transition-colors">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                <Clock size={13} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block leading-tight">
                  {t('Response', 'Respon')}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-[var(--text-main)] mt-0.5 block truncate">
                  {displayResponseTime}
                </span>
              </div>
            </div>
          </div>

          {/* Let's Connect Social Bar Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-3 sm:p-4 backdrop-blur-xl transition-colors duration-250">
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider block mb-2.5">
              &mdash; {t("LET'S CONNECT", 'JARINGAN SOSIAL')} &mdash;
            </span>

            <div className="grid grid-cols-4 gap-2">
              {socialLinks.map((soc) => (
                <a
                  key={soc.label}
                  href={soc.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={soc.label}
                  className="py-2 sm:py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--card-border)] hover:border-accent/50 hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center transition-colors"
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}