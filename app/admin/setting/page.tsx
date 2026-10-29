"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Globe,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  Send,
  Share2,
  ImageIcon,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";
import { useCachedFetch, clientCache } from "@/lib/client-cache";

export default function AdminSettingPage() {
  const { toast } = useToast();
  const [siteName, setSiteName] = useState("Master SMM");
  const [logo, setLogo] = useState("/logo.png");
  const [favicon, setFavicon] = useState("/favicon.ico");
  const [apiApp, setApiApp] = useState("smm_app_key_master_live_2026");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [telegram, setTelegram] = useState("");
  const [urlImageKit, setUrlImageKit] = useState("");
  const [imagekitApi, setImagekitApi] = useState("");
  const [imagekitSecret, setImagekitSecret] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: settingData, isLoading } = useCachedFetch<any>("/api/admin/setting", {
    ttlMs: 120_000,
    onSuccess: (data) => {
      if (data) {
        if (data.site_name) setSiteName(data.site_name);
        if (data.logo) setLogo(data.logo);
        if (data.favicon) setFavicon(data.favicon);
        if (data.api_app) setApiApp(data.api_app);
        if (data.email) setEmail(data.email);
        if (data.whatsapp) setWhatsapp(data.whatsapp);
        if (data.instagram) setInstagram(data.instagram);
        if (data.facebook) setFacebook(data.facebook);
        if (data.tiktok) setTiktok(data.tiktok);
        if (data.telegram) setTelegram(data.telegram);
        if (data.url_image_kit) setUrlImageKit(data.url_image_kit);
        if (data.imagekit_api) setImagekitApi(data.imagekit_api);
        if (data.imagekit_secret) setImagekitSecret(data.imagekit_secret);
      }
    },
  });

  useEffect(() => {
    if (settingData) {
      if (settingData.site_name) setSiteName(settingData.site_name);
      if (settingData.logo) setLogo(settingData.logo);
      if (settingData.favicon) setFavicon(settingData.favicon);
      if (settingData.api_app) setApiApp(settingData.api_app);
      if (settingData.email) setEmail(settingData.email);
      if (settingData.whatsapp) setWhatsapp(settingData.whatsapp);
      if (settingData.instagram) setInstagram(settingData.instagram);
      if (settingData.facebook) setFacebook(settingData.facebook);
      if (settingData.tiktok) setTiktok(settingData.tiktok);
      if (settingData.telegram) setTelegram(settingData.telegram);
      if (settingData.url_image_kit) setUrlImageKit(settingData.url_image_kit);
      if (settingData.imagekit_api) setImagekitApi(settingData.imagekit_api);
      if (settingData.imagekit_secret) setImagekitSecret(settingData.imagekit_secret);
    }
  }, [settingData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: siteName,
          logo,
          favicon,
          api_app: apiApp,
          email,
          whatsapp,
          instagram,
          facebook,
          tiktok,
          telegram,
          url_image_kit: urlImageKit,
          imagekit_api: imagekitApi,
          imagekit_secret: imagekitSecret,
        }),
      });

      const json = await res.json();
      if (json.success) {
        clientCache.set("/api/admin/setting", json.data || {
          site_name: siteName,
          logo,
          favicon,
          api_app: apiApp,
          email,
          whatsapp,
          instagram,
          facebook,
          tiktok,
          telegram,
          url_image_kit: urlImageKit,
          imagekit_api: imagekitApi,
          imagekit_secret: imagekitSecret,
        });
        toast.success("Pengaturan Disimpan", json.message || "Pengaturan website berhasil diperbarui.");
      } else {
        toast.error("Gagal Menyimpan", json.message || "Gagal menyimpan pengaturan.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Kesalahan Jaringan", "Terjadi kesalahan jaringan saat menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Pengaturan Sistem
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi identitas situs dan API master.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
          <p className="text-xs">Memuat pengaturan...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Identitas Website</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Website
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  API Key Master
                </label>
                <input
                  type="text"
                  value={apiApp}
                  onChange={(e) => setApiApp(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL Logo
                </label>
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="/logo.png"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL Favicon
                </label>
                <input
                  type="text"
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  placeholder="/favicon.ico"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contact & Social Media */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-600" />
              <span>Kontak & Media Sosial</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Email Support</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="support@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>WhatsApp</span>
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+628123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Instagram</span>
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/username atau @username"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Facebook</span>
                </label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/username"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>TikTok</span>
                </label>
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="https://tiktok.com/@username atau @username"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-slate-500" />
                  <span>Telegram</span>
                </label>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="https://t.me/username atau @username"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ImageKit CDN Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Konfigurasi ImageKit (CDN &amp; Storage)</span>
              </h3>
              <span className="text-[11px] font-medium text-slate-400">Media Upload CDN</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL Endpoint (url_image_kit)
                </label>
                <input
                  type="text"
                  value={urlImageKit}
                  onChange={(e) => setUrlImageKit(e.target.value)}
                  placeholder="https://ik.imagekit.io/your_id"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Public API Key (imagekit_api)
                </label>
                <input
                  type="text"
                  value={imagekitApi}
                  onChange={(e) => setImagekitApi(e.target.value)}
                  placeholder="public_..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Private Key (imagekit_secret)
                </label>
                <input
                  type="password"
                  value={imagekitSecret}
                  onChange={(e) => setImagekitSecret(e.target.value)}
                  placeholder="private_..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Security & Maintenance */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Opsi Sistem</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-xs text-slate-900">Registrasi Terbuka</p>
                  <p className="text-[11px] text-slate-500">Menerima pendaftaran pengguna baru di halaman registrasi</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengaturan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
