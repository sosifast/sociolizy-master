"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Shield,
  Rocket,
  Check,
  Trophy,
  Heart,
  Users,
  Star,
  Clock,
  Globe,
  Award,
  Sparkles,
  BarChart,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Play,
  HelpCircle,
} from "lucide-react";
import { PageBlock } from "@/lib/page-builder-types";

// Icon resolver helper
function renderIcon(name?: string, className: string = "w-5 h-5") {
  if (!name) return <Sparkles className={className} />;
  const lower = name.toLowerCase();

  switch (lower) {
    case "zap":
    case "lightning":
    case "fast":
      return <Zap className={className} />;
    case "shield":
    case "safe":
    case "security":
      return <Shield className={className} />;
    case "rocket":
    case "launch":
    case "speed":
      return <Rocket className={className} />;
    case "check":
    case "verified":
      return <Check className={className} />;
    case "trophy":
    case "winner":
      return <Trophy className={className} />;
    case "heart":
    case "love":
      return <Heart className={className} />;
    case "users":
    case "community":
      return <Users className={className} />;
    case "star":
    case "rating":
      return <Star className={className} />;
    case "clock":
    case "time":
      return <Clock className={className} />;
    case "globe":
    case "worldwide":
      return <Globe className={className} />;
    case "award":
      return <Award className={className} />;
    case "barchart":
    case "growth":
      return <BarChart className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

interface PageBlockRendererProps {
  block: PageBlock;
}

export default function PageBlockRenderer({ block }: PageBlockRendererProps) {
  const { type, content } = block;

  switch (type) {
    // ----------------------------------------------------
    // HERO BLOCK
    // ----------------------------------------------------
    case "hero": {
      const c = content as any;
      const isCenter = c.align !== "left";

      // Background style
      let bgClasses = "bg-white border border-slate-200/90 text-slate-900";
      if (c.bgStyle === "emerald") {
        bgClasses = "bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg";
      } else if (c.bgStyle === "dark") {
        bgClasses = "bg-slate-900 text-white shadow-xl";
      } else if (c.bgStyle === "gradient") {
        bgClasses = "bg-gradient-to-b from-emerald-50/60 via-white to-slate-50/50 border border-slate-200/80 text-slate-900";
      }

      return (
        <section className={`rounded-3xl p-8 sm:p-14 transition-all overflow-hidden relative ${bgClasses}`}>
          {/* Subtle glow effect for dark/emerald */}
          {(c.bgStyle === "emerald" || c.bgStyle === "dark") && (
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          )}

          <div className={`relative z-10 max-w-4xl ${isCenter ? "mx-auto text-center" : "text-left"} space-y-6`}>
            {/* Badge */}
            {c.badge && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                c.bgStyle === "emerald" || c.bgStyle === "dark"
                  ? "bg-white/15 text-emerald-200 backdrop-blur-xs"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-200/60"
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{c.badge}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {c.title}
            </h1>

            {/* Subtitle */}
            {c.subtitle && (
              <p className={`text-base sm:text-lg lg:text-xl font-normal max-w-2xl ${isCenter ? "mx-auto" : ""} leading-relaxed ${
                c.bgStyle === "emerald" || c.bgStyle === "dark" ? "text-slate-200" : "text-slate-600"
              }`}>
                {c.subtitle}
              </p>
            )}

            {/* Buttons */}
            {(c.primaryBtnText || c.secondaryBtnText) && (
              <div className={`pt-2 flex flex-wrap items-center gap-3.5 ${isCenter ? "justify-center" : "justify-start"}`}>
                {c.primaryBtnText && (
                  <Link
                    href={c.primaryBtnUrl || "#"}
                    className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md ${
                      c.bgStyle === "emerald" || c.bgStyle === "dark"
                        ? "bg-white text-emerald-900 hover:bg-slate-100"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                    }`}
                  >
                    <span>{c.primaryBtnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {c.secondaryBtnText && (
                  <Link
                    href={c.secondaryBtnUrl || "#"}
                    className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all hover:bg-white/10 ${
                      c.bgStyle === "emerald" || c.bgStyle === "dark"
                        ? "border border-white/30 text-white hover:border-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{c.secondaryBtnText}</span>
                  </Link>
                )}
              </div>
            )}

            {/* Hero Stats Row */}
            {(c.stat1Value || c.stat2Value || c.stat3Value) && (
              <div className={`pt-8 border-t ${
                c.bgStyle === "emerald" || c.bgStyle === "dark" ? "border-white/15" : "border-slate-200"
              } grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl ${isCenter ? "mx-auto" : ""}`}>
                {c.stat1Value && (
                  <div>
                    <p className="text-2xl sm:text-3xl font-black">{c.stat1Value}</p>
                    <p className={`text-xs ${c.bgStyle === "emerald" || c.bgStyle === "dark" ? "text-emerald-100" : "text-slate-500"}`}>{c.stat1Label}</p>
                  </div>
                )}
                {c.stat2Value && (
                  <div>
                    <p className="text-2xl sm:text-3xl font-black">{c.stat2Value}</p>
                    <p className={`text-xs ${c.bgStyle === "emerald" || c.bgStyle === "dark" ? "text-emerald-100" : "text-slate-500"}`}>{c.stat2Label}</p>
                  </div>
                )}
                {c.stat3Value && (
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-2xl sm:text-3xl font-black">{c.stat3Value}</p>
                    <p className={`text-xs ${c.bgStyle === "emerald" || c.bgStyle === "dark" ? "text-emerald-100" : "text-slate-500"}`}>{c.stat3Label}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    // ----------------------------------------------------
    // HEADING & TEXT BLOCK
    // ----------------------------------------------------
    case "heading_text": {
      const c = content as any;
      const alignClass =
        c.align === "center" ? "text-center mx-auto" : c.align === "right" ? "text-right ml-auto" : "text-left";

      return (
        <section className={`space-y-3 max-w-4xl py-4 ${alignClass}`}>
          {c.level === "h1" && (
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {c.title}
            </h1>
          )}
          {c.level === "h2" && (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {c.title}
            </h2>
          )}
          {c.level === "h3" && (
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {c.title}
            </h3>
          )}
          {(!c.level || c.level === "h4") && (
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {c.title}
            </h4>
          )}

          {c.subtitle && (
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              {c.subtitle}
            </p>
          )}

          {c.content && (
            <div className="pt-2 text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {c.content}
            </div>
          )}
        </section>
      );
    }

    // ----------------------------------------------------
    // FEATURES GRID BLOCK
    // ----------------------------------------------------
    case "features": {
      const c = content as any;
      const cols = c.columns === 2 ? "sm:grid-cols-2" : c.columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";

      return (
        <section className="space-y-8 py-4">
          {(c.title || c.subtitle) && (
            <div className="text-center max-w-2xl mx-auto space-y-2">
              {c.title && (
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {c.title}
                </h2>
              )}
              {c.subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {c.subtitle}
                </p>
              )}
            </div>
          )}

          <div className={`grid grid-cols-1 ${cols} gap-6`}>
            {(c.items || []).map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {renderIcon(item.icon, "w-6 h-6")}
                  </div>
                  {item.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    // ----------------------------------------------------
    // PRICING CARDS BLOCK
    // ----------------------------------------------------
    case "pricing": {
      const c = content as any;
      const cols = c.columns === 2 ? "sm:grid-cols-2 max-w-3xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3";

      return (
        <section className="space-y-8 py-4">
          {(c.title || c.subtitle) && (
            <div className="text-center max-w-2xl mx-auto space-y-2">
              {c.title && (
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {c.title}
                </h2>
              )}
              {c.subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {c.subtitle}
                </p>
              )}
            </div>
          )}

          <div className={`grid grid-cols-1 ${cols} gap-6`}>
            {(c.items || []).map((tier: any, idx: number) => {
              const isPopular = tier.isPopular;
              return (
                <div
                  key={tier.id || idx}
                  className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 relative ${
                    isPopular
                      ? "bg-slate-900 text-white shadow-xl border-2 border-emerald-500 scale-[1.02]"
                      : "bg-white text-slate-900 border border-slate-200/90 shadow-2xs hover:shadow-lg"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
                      {tier.badge || "Most Popular"}
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      {!isPopular && tier.badge && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 mb-2">
                          {tier.badge}
                        </span>
                      )}
                      <h3 className="text-lg font-bold">{tier.name}</h3>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight">{tier.price}</span>
                      {tier.period && (
                        <span className={`text-xs ${isPopular ? "text-slate-400" : "text-slate-500"}`}>
                          /{tier.period}
                        </span>
                      )}
                    </div>

                    {/* Features list */}
                    {tier.features && tier.features.length > 0 && (
                      <ul className="space-y-2.5 pt-4 border-t border-slate-200/20 text-xs sm:text-sm">
                        {tier.features.map((f: string, fIdx: number) => (
                          <li key={fIdx} className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className={isPopular ? "text-slate-200" : "text-slate-600"}>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-6">
                    <Link
                      href={tier.buttonUrl || "/auth/register"}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all text-center ${
                        isPopular
                          ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      <span>{tier.buttonText || "Choose Plan"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    // ----------------------------------------------------
    // CTA BANNER BLOCK
    // ----------------------------------------------------
    case "cta_banner": {
      const c = content as any;
      let bgStyle = "bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl";
      if (c.style === "dark") {
        bgStyle = "bg-slate-900 text-white shadow-xl";
      } else if (c.style === "clean") {
        bgStyle = "bg-white text-slate-900 border border-slate-200 shadow-xs";
      }

      const isLight = c.style === "clean";

      return (
        <section className={`rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 ${bgStyle}`}>
          {!isLight && (
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          )}

          <div className="relative z-10 space-y-2 max-w-xl">
            {c.badge && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                isLight ? "bg-emerald-100 text-emerald-800" : "bg-white/15 text-emerald-100 backdrop-blur-xs"
              }`}>
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{c.badge}</span>
              </span>
            )}
            <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
              {c.title}
            </h3>
            {c.description && (
              <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-emerald-100"}`}>
                {c.description}
              </p>
            )}
          </div>

          <div className="relative z-10 shrink-0 flex flex-wrap items-center gap-3">
            {c.primaryBtnText && (
              <Link
                href={c.primaryBtnUrl || "/auth/register"}
                className={`px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] ${
                  isLight
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-white text-emerald-900 hover:bg-slate-100"
                }`}
              >
                {c.primaryBtnText}
              </Link>
            )}
            {c.secondaryBtnText && (
              <Link
                href={c.secondaryBtnUrl || "#"}
                className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm border transition-colors ${
                  isLight
                    ? "border-slate-300 text-slate-700 hover:bg-slate-50"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                {c.secondaryBtnText}
              </Link>
            )}
          </div>
        </section>
      );
    }

    // ----------------------------------------------------
    // FAQ ACCORDION BLOCK
    // ----------------------------------------------------
    case "faq": {
      const c = content as any;
      return <FaqAccordionView title={c.title} subtitle={c.subtitle} items={c.items || []} />;
    }

    // ----------------------------------------------------
    // TESTIMONIALS BLOCK
    // ----------------------------------------------------
    case "testimonials": {
      const c = content as any;
      return (
        <section className="space-y-8 py-4">
          {(c.title || c.subtitle) && (
            <div className="text-center max-w-2xl mx-auto space-y-2">
              {c.title && (
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {c.title}
                </h2>
              )}
              {c.subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {c.subtitle}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(c.items || []).map((t: any, idx: number) => (
              <div
                key={t.id || idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: t.rating || 5 }).map((_, sIdx) => (
                      <Star key={sIdx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                    {t.name?.substring(0, 2) || "U"}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t.name}</h4>
                    {t.role && <p className="text-[11px] text-slate-400">{t.role}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    // ----------------------------------------------------
    // STATS BLOCK
    // ----------------------------------------------------
    case "stats": {
      const c = content as any;
      return (
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-2xs space-y-6">
          {c.title && (
            <h3 className="text-lg font-bold text-slate-800 text-center">{c.title}</h3>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {(c.items || []).map((item: any, idx: number) => (
              <div key={item.id || idx} className="pt-4 md:pt-0 px-2 space-y-1">
                <p className="text-2xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                  {item.value}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    // ----------------------------------------------------
    // IMAGE BLOCK
    // ----------------------------------------------------
    case "image": {
      const c = content as any;
      const imgContent = (
        <div className="space-y-2">
          <div className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100 aspect-video relative">
            <img
              src={c.imageUrl || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80"}
              alt={c.altText || "Custom Page Image"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {c.caption && (
            <p className="text-xs text-slate-400 text-center italic">{c.caption}</p>
          )}
        </div>
      );

      if (c.clickUrl) {
        return (
          <Link href={c.clickUrl} className="block transition-transform hover:scale-[1.01]">
            {imgContent}
          </Link>
        );
      }
      return imgContent;
    }

    // ----------------------------------------------------
    // VIDEO BLOCK
    // ----------------------------------------------------
    case "video": {
      const c = content as any;
      let embedUrl = c.videoUrl || "";
      if (embedUrl.includes("youtube.com/watch?v=")) {
        embedUrl = embedUrl.replace("watch?v=", "embed/");
      } else if (embedUrl.includes("youtu.be/")) {
        embedUrl = embedUrl.replace("youtu.be/", "youtube.com/embed/");
      }

      return (
        <section className="space-y-3">
          {c.title && <h3 className="font-bold text-slate-900 text-lg">{c.title}</h3>}
          <div className="aspect-video rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-900">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={c.title || "Video"}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <Play className="w-10 h-10" />
                <span className="text-xs">No video URL provided</span>
              </div>
            )}
          </div>
          {c.caption && (
            <p className="text-xs text-slate-400 text-center italic">{c.caption}</p>
          )}
        </section>
      );
    }

    // ----------------------------------------------------
    // BUTTONS GROUP BLOCK
    // ----------------------------------------------------
    case "buttons": {
      const c = content as any;
      const alignClass =
        c.align === "center" ? "justify-center" : c.align === "right" ? "justify-end" : "justify-start";

      return (
        <section className={`flex flex-wrap items-center gap-3 py-3 ${alignClass}`}>
          {(c.items || []).map((btn: any, idx: number) => {
            let btnStyle = "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm";
            if (btn.variant === "outline") {
              btnStyle = "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50";
            } else if (btn.variant === "secondary") {
              btnStyle = "bg-slate-900 text-white hover:bg-slate-800";
            } else if (btn.variant === "white") {
              btnStyle = "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-2xs";
            }

            const sizeClass =
              btn.size === "sm" ? "px-3 py-1.5 text-xs" : btn.size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2.5 text-sm";

            return (
              <Link
                key={btn.id || idx}
                href={btn.url || "#"}
                className={`rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1.5 ${btnStyle} ${sizeClass}`}
              >
                <span>{btn.text}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            );
          })}
        </section>
      );
    }

    // ----------------------------------------------------
    // DIVIDER BLOCK
    // ----------------------------------------------------
    case "divider": {
      const c = content as any;
      const spacingClass =
        c.spacing === "sm" ? "my-4" : c.spacing === "lg" ? "my-12" : "my-8";
      const styleClass =
        c.style === "dashed"
          ? "border-t border-dashed border-slate-200"
          : c.style === "transparent"
          ? "border-0"
          : "border-t border-slate-200";

      return <hr className={`${spacingClass} ${styleClass}`} />;
    }

    // ----------------------------------------------------
    // CUSTOM CODE BLOCK
    // ----------------------------------------------------
    case "custom_code": {
      const c = content as any;
      return (
        <section className="py-2">
          {c.title && <p className="text-xs font-bold text-slate-400 mb-1">{c.title}</p>}
          <div dangerouslySetInnerHTML={{ __html: c.html || "" }} />
        </section>
      );
    }

    default:
      return null;
  }
}

// Collapsible FAQ Accordion Component
function FaqAccordionView({
  title,
  subtitle,
  items,
}: {
  title?: string;
  subtitle?: string;
  items: { id: string; question: string; answer: string }[];
}) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="space-y-6 max-w-3xl mx-auto py-4">
      {(title || subtitle) && (
        <div className="text-center space-y-2">
          {title && (
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = !!openIds[item.id || String(idx)];
          return (
            <div
              key={item.id || idx}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(item.id || String(idx))}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors gap-3"
              >
                <span className="font-bold text-slate-900 text-sm sm:text-base">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-emerald-600" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

