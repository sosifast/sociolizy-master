"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Home,
  ChevronRight,
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Settings,
  Sparkles,
  Layers,
  CheckCircle2,
  Type,
  LayoutGrid,
  CreditCard,
  Megaphone,
  HelpCircle,
  MessageSquare,
  BarChart2,
  Image as ImageIcon,
  Video,
  MousePointerClick,
  Minus,
  Code2,
  Maximize2,
  Minimize2,
  Sliders,
  Check,
  GripVertical,
  X,
  Star,
  FileText,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";
import {
  BlockType,
  PageBlock,
  PageStyles,
  CustomPageData,
  STARTER_TEMPLATES,
} from "@/lib/page-builder-types";
import PageBlockRenderer from "@/app/page/components/page-block-renderer";
import { generateSlug } from "@/lib/blog-utils";

// ============================================================================
// BLOCK CATALOG DEFINITIONS
// ============================================================================
interface BlockCatalogEntry {
  type: BlockType;
  label: string;
  category: "hero" | "content" | "commerce" | "info";
  description: string;
  icon: any;
  defaultContent: any;
}

const BLOCK_CATALOG: BlockCatalogEntry[] = [
  {
    type: "hero",
    label: "Hero Section",
    category: "hero",
    description: "High-impact banner with headline, CTA buttons, and stats",
    icon: Sparkles,
    defaultContent: {
      badge: "Exclusive Launch Offer",
      title: "Scale Your Social Media Growth Faster",
      subtitle: "Automated wholesale SMM services with instant delivery and 24/7 dedicated support.",
      primaryBtnText: "Explore Services",
      primaryBtnUrl: "/services",
      secondaryBtnText: "Get Started Free",
      secondaryBtnUrl: "/auth/register",
      align: "center",
      bgStyle: "gradient",
      stat1Value: "99.9%",
      stat1Label: "Uptime",
      stat2Value: "10M+",
      stat2Label: "Orders",
      stat3Value: "24/7",
      stat3Label: "Support",
    },
  },
  {
    type: "cta_banner",
    label: "CTA Banner",
    category: "hero",
    description: "Conversion banner with primary & secondary buttons",
    icon: Megaphone,
    defaultContent: {
      badge: "Limited Time Offer",
      title: "Ready to Supercharge Your Social Media Agency?",
      description: "Create an account in seconds and unlock wholesale SMM rates with zero deposit minimums.",
      primaryBtnText: "Sign Up Free",
      primaryBtnUrl: "/auth/register",
      secondaryBtnText: "View Pricing",
      secondaryBtnUrl: "/services",
      style: "emerald",
    },
  },
  {
    type: "heading_text",
    label: "Heading & Text",
    category: "content",
    description: "Rich typography section with H1-H4 headings and body",
    icon: Type,
    defaultContent: {
      level: "h2",
      title: "Why Our SMM Platform Outperforms Competitors",
      subtitle: "Discover how thousands of agencies automate their growth operations daily.",
      align: "left",
      content: "We provide high-retention social media engagement powered by enterprise server nodes.",
    },
  },
  {
    type: "features",
    label: "Features Grid",
    category: "commerce",
    description: "2, 3, or 4 column cards with icons and descriptions",
    icon: LayoutGrid,
    defaultContent: {
      title: "Platform Highlights",
      subtitle: "Enterprise infrastructure tailored for fast-moving resellers.",
      columns: 3,
      items: [
        {
          id: "feat-1",
          icon: "Zap",
          title: "Instant API Dispatch",
          description: "Orders start within 60 seconds of submission.",
          badge: "Fast",
        },
        {
          id: "feat-2",
          icon: "Shield",
          title: "Drop Protection",
          description: "Automated refill ensures accounts stay healthy.",
          badge: "Safe",
        },
        {
          id: "feat-3",
          icon: "Rocket",
          title: "Wholesale Rates",
          description: "Lowest prices guaranteed to maximize your margin.",
          badge: "Best Value",
        },
      ],
    },
  },
  {
    type: "pricing",
    label: "Pricing Table",
    category: "commerce",
    description: "Compare tiers with feature checklists and action buttons",
    icon: CreditCard,
    defaultContent: {
      title: "Flexible Tier Packages",
      subtitle: "Choose the volume plan that fits your agency.",
      columns: 3,
      items: [
        {
          id: "p-tier-1",
          name: "Starter",
          price: "$10",
          period: "min deposit",
          badge: "Beginner",
          isPopular: false,
          features: ["Full service access", "Instant delivery", "Standard API"],
          buttonText: "Deposit $10",
          buttonUrl: "/auth/register",
        },
        {
          id: "p-tier-2",
          name: "Pro Reseller",
          price: "$50",
          period: "min deposit",
          badge: "Popular",
          isPopular: true,
          features: ["5% Bonus balance", "Priority support", "30-day refill guarantee"],
          buttonText: "Get Pro Plan",
          buttonUrl: "/auth/register",
        },
        {
          id: "p-tier-3",
          name: "Enterprise",
          price: "$200+",
          period: "volume tier",
          badge: "VIP",
          isPopular: false,
          features: ["10% Bonus balance", "Dedicated account manager", "Custom API rate limits"],
          buttonText: "Contact Us",
          buttonUrl: "/page/contact-us",
        },
      ],
    },
  },
  {
    type: "faq",
    label: "FAQ Accordion",
    category: "info",
    description: "Expandable questions and answers accordion",
    icon: HelpCircle,
    defaultContent: {
      title: "Frequently Asked Questions",
      subtitle: "Answers to common questions about services and payments.",
      items: [
        {
          id: "faq-1",
          question: "How fast is delivery?",
          answer: "Most services begin processing within 1 to 5 minutes automatically.",
        },
        {
          id: "faq-2",
          question: "What payment methods are supported?",
          answer: "We support Cryptomus (crypto coins) and automated card gateways.",
        },
        {
          id: "faq-3",
          question: "Can I connect my own panel via API?",
          answer: "Yes, our REST API supports standard v2 specifications for instant order sync.",
        },
      ],
    },
  },
  {
    type: "testimonials",
    label: "Testimonials",
    category: "commerce",
    description: "Customer reviews with 5-star ratings and client quotes",
    icon: MessageSquare,
    defaultContent: {
      title: "Client Testimonials",
      subtitle: "See what top agency owners say about our reliability.",
      items: [
        {
          id: "test-1",
          name: "Marcus Vance",
          role: "Agency Founder",
          rating: 5,
          content: "The delivery speed is incredible. We handle hundreds of daily orders without issue.",
        },
        {
          id: "test-2",
          name: "Elena Rostova",
          role: "Growth Reseller",
          rating: 5,
          content: "Best wholesale rates in the industry. Customer support answers within minutes!",
        },
        {
          id: "test-3",
          name: "David Kim",
          role: "Marketing Director",
          rating: 5,
          content: "API integration took only 10 minutes. Orders sync seamlessly with automated refill.",
        },
      ],
    },
  },
  {
    type: "stats",
    label: "Stats Counter",
    category: "info",
    description: "Highlighted metrics and achievement numbers",
    icon: BarChart2,
    defaultContent: {
      title: "Key Metrics",
      items: [
        { id: "s-1", value: "10M+", label: "Orders Completed" },
        { id: "s-2", value: "99.9%", label: "System Uptime" },
        { id: "s-3", value: "25K+", label: "Active Resellers" },
        { id: "s-4", value: "24/7", label: "Live Support" },
      ],
    },
  },
  {
    type: "image",
    label: "Image Banner",
    category: "content",
    description: "Responsive cover image with caption and click link",
    icon: ImageIcon,
    defaultContent: {
      imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80",
      altText: "Social Media Dashboard",
      caption: "Automated dashboard interface with real-time analytics.",
      clickUrl: "",
    },
  },
  {
    type: "video",
    label: "Video Embed",
    category: "content",
    description: "YouTube or Vimeo responsive video player",
    icon: Video,
    defaultContent: {
      title: "Platform Overview",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      caption: "Watch how to connect your SMM API in 3 easy steps.",
    },
  },
  {
    type: "buttons",
    label: "Button Group",
    category: "content",
    description: "Row of action buttons with custom links and styles",
    icon: MousePointerClick,
    defaultContent: {
      align: "center",
      items: [
        { id: "btn-1", text: "Explore All Services", url: "/services", variant: "primary", size: "md" },
        { id: "btn-2", text: "Create Free Account", url: "/auth/register", variant: "outline", size: "md" },
      ],
    },
  },
  {
    type: "divider",
    label: "Divider / Spacer",
    category: "content",
    description: "Visual spacing separator line between sections",
    icon: Minus,
    defaultContent: {
      style: "solid",
      spacing: "md",
    },
  },
  {
    type: "custom_code",
    label: "Custom HTML",
    category: "info",
    description: "Embed custom widgets, trust badges, or raw HTML",
    icon: Code2,
    defaultContent: {
      title: "Trust Badge",
      html: '<div class="p-5 text-center text-xs text-slate-500 bg-slate-100 rounded-2xl border border-slate-200">🔒 SSL 256-Bit Encrypted & Verified Reseller Partner</div>',
    },
  },
];

export default function EditCustomPageBuilder() {
  const router = useRouter();
  const { toast } = useToast();
  const urlParams = useParams();
  const pageId = (urlParams?.id as string) || "";

  // Page state
  const [page, setPage] = useState<CustomPageData | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [styles, setStyles] = useState<PageStyles>({
    containerWidth: "max-w-7xl",
    bgColor: "bg-slate-50",
    showNavbar: true,
    showFooter: true,
  });

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"canvas" | "blocks" | "settings">("canvas");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Drag and Drop state
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedCatalogType, setDraggedCatalogType] = useState<BlockType | null>(null);
  const [insertPickerIndex, setInsertPickerIndex] = useState<number | null>(null);

  // Fetch page data
  useEffect(() => {
    if (!pageId) return;
    async function loadPage() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const res = await fetch(`/api/admin/page-builder/${pageId}`);
        const json = await res.json();

        if (json.success && json.data) {
          const p = json.data;
          setPage(p);
          setTitle(p.title || "");
          setSlug(p.slug || "");
          setDescription(p.description || "");
          setStatus(p.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
          setMetaTitle(p.meta_title || "");
          setMetaDescription(p.meta_description || "");
          const loadedBlocks = Array.isArray(p.blocks) ? p.blocks : [];
          setBlocks(loadedBlocks);
          if (p.styles) {
            setStyles(p.styles);
          }
          if (loadedBlocks.length > 0) {
            setSelectedBlockId(loadedBlocks[0].id);
          }
        } else {
          setLoadError(json.message || "Failed to load page.");
          toast.error("Error", json.message || "Failed to load page");
        }
      } catch (err: any) {
        console.error(err);
        setLoadError(err.message || "Network connection error.");
        toast.error("Network Error", "Unable to connect to server.");
      } finally {
        setIsLoading(false);
      }
    }
    loadPage();
  }, [pageId, toast]);

  // Save page handler
  const handleSavePage = async (overrideStatus?: "DRAFT" | "PUBLISHED") => {
    if (!pageId) return;
    setIsSaving(true);
    const saveStatus = overrideStatus || status;

    try {
      const res = await fetch(`/api/admin/page-builder/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          status: saveStatus,
          meta_title: metaTitle || title,
          meta_description: metaDescription || description,
          blocks,
          styles,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatus(saveStatus);
        toast.success(
          "Changes Saved",
          saveStatus === "PUBLISHED"
            ? `Page is live at /${slug}`
            : "Draft saved successfully."
        );
      } else {
        toast.error("Save Failed", json.message || "Could not save page");
      }
    } catch (err) {
      toast.error("Network Error", "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add block to canvas
  const handleAddBlock = (type: BlockType, targetIndex?: number) => {
    const catalogItem = BLOCK_CATALOG.find((b) => b.type === type);
    if (!catalogItem) return;

    const newBlock: PageBlock = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      content: JSON.parse(JSON.stringify(catalogItem.defaultContent)),
    };

    setBlocks((prev) => {
      const next = [...prev];
      if (typeof targetIndex === "number" && targetIndex >= 0 && targetIndex <= next.length) {
        next.splice(targetIndex, 0, newBlock);
      } else {
        next.push(newBlock);
      }
      return next;
    });

    setSelectedBlockId(newBlock.id);
    setActiveTab("canvas");
    setInsertPickerIndex(null);
    toast.success("Section Added", `Inserted ${catalogItem.label}.`);
  };

  // Move block up or down
  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= blocks.length) return;

    const next = [...blocks];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setBlocks(next);
  };

  // Reorder via Drag and Drop
  const handleReorder = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) return;
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggedBlockIndex(null);
    setDragOverIndex(null);
    toast.success("Reordered", "Section moved.");
  };

  // Duplicate block
  const handleDuplicateBlock = (index: number) => {
    const source = blocks[index];
    const cloned: PageBlock = {
      id: `${source.type}-${Date.now()}`,
      type: source.type,
      content: JSON.parse(JSON.stringify(source.content)),
    };
    const next = [...blocks];
    next.splice(index + 1, 0, cloned);
    setBlocks(next);
    setSelectedBlockId(cloned.id);
    toast.success("Duplicated", "Section duplicated.");
  };

  // Delete block
  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
    toast.success("Deleted", "Section removed.");
  };

  // Apply template
  const handleApplyTemplate = (tmplId: string) => {
    const tmpl = STARTER_TEMPLATES.find((t) => t.id === tmplId);
    if (!tmpl) return;

    if (
      blocks.length > 0 &&
      !window.confirm("Applying this layout will replace existing sections. Continue?")
    ) {
      return;
    }

    const clonedBlocks = tmpl.blocks.map((b) => ({
      ...b,
      id: `${b.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    }));

    setBlocks(clonedBlocks);
    if (clonedBlocks.length > 0) {
      setSelectedBlockId(clonedBlocks[0].id);
    }
    setActiveTab("canvas");
    toast.success("Layout Loaded", `Applied "${tmpl.name}".`);
  };

  // Update selected block content helper
  const updateSelectedBlockContent = (newContent: any) => {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((b) => (b.id === selectedBlockId ? { ...b, content: newContent } : b))
    );
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600">Loading Page Builder Studio...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-slate-900 text-lg">Page Not Found</h3>
        <p className="text-xs sm:text-sm text-slate-500">{loadError}</p>
        <Link
          href="/admin/page-builder"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Page Builder</span>
        </Link>
      </div>
    );
  }

  // Device width wrapper
  let deviceContainerWidth = "w-full";
  if (previewDevice === "tablet") {
    deviceContainerWidth = "max-w-[768px]";
  } else if (previewDevice === "mobile") {
    deviceContainerWidth = "max-w-[390px]";
  }

  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-slate-100 overflow-y-auto p-4 sm:p-6"
    : "space-y-6 pb-20";

  return (
    <div className={containerClass}>
      {/* 1. Breadcrumbs (hidden in fullscreen) */}
      {!isFullscreen && (
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Dashboard</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link
            href="/admin/page-builder"
            className="hover:text-emerald-600 transition-colors"
          >
            Page Builder
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-[200px]">
            {title || "Untitled"}
          </span>
        </nav>
      )}

      {/* 2. Top Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Back & Title info */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/page-builder"
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shrink-0"
            title="Back to Pages"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-slate-900 text-base sm:text-lg truncate">
                {title || "Untitled Page"}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  status === "PUBLISHED"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-[11px] font-mono text-emerald-600 font-semibold truncate">
              https://domain.com/{slug}
            </p>
          </div>
        </div>

        {/* Center: Device Viewport Controls */}
        <div className="flex items-center self-start md:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setPreviewDevice("desktop")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              previewDevice === "desktop"
                ? "bg-white text-emerald-600 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice("tablet")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              previewDevice === "tablet"
                ? "bg-white text-emerald-600 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice("mobile")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              previewDevice === "mobile"
                ? "bg-white text-emerald-600 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Studio Mode"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Preview Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
              isPreviewMode
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            title="Preview how visitors interact with the page"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreviewMode ? "Editing Mode" : "Preview Mode"}</span>
          </button>

          {/* View Live */}
          <Link
            href={`/${slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>View Live</span>
          </Link>

          {/* Save Draft */}
          <button
            type="button"
            onClick={() => handleSavePage("DRAFT")}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Draft</span>
          </button>

          {/* Save & Publish */}
          <button
            type="button"
            onClick={() => handleSavePage("PUBLISHED")}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Publish Page</span>
          </button>
        </div>
      </div>

      {/* 3. Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==================================================== */}
        {/* CENTER / LEFT: THE VISUAL CANVAS (8 cols) */}
        {/* ==================================================== */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          {/* Quick Add Section Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-600 shrink-0 flex items-center gap-1 pl-1">
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Click or Drag:</span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {BLOCK_CATALOG.slice(0, 8).map((b) => (
                <button
                  key={b.type}
                  type="button"
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/x-page-builder-catalog", b.type);
                    setDraggedCatalogType(b.type);
                  }}
                  onDragEnd={() => setDraggedCatalogType(null)}
                  onClick={() => handleAddBlock(b.type)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 text-slate-700 font-bold text-[11px] shrink-0 transition-colors flex items-center gap-1 cursor-grab active:cursor-grabbing"
                  title="Click to add or drag into canvas"
                >
                  <GripVertical className="w-2.5 h-2.5 text-slate-400" />
                  <span>+{b.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* The Page Canvas Container */}
          <div className="flex flex-col items-center">
            <div className={`${deviceContainerWidth} transition-all duration-200 space-y-6 w-full`}>
              <div
                className={`rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 min-h-[550px] transition-all relative ${
                  styles.bgColor || "bg-white"
                }`}
              >
                {/* Navbar mockup */}
                {styles.showNavbar !== false && (
                  <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-slate-700">Navbar Preview</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">Enabled</span>
                  </div>
                )}

                {/* Empty State */}
                {blocks.length === 0 ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "copy";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const catType = e.dataTransfer.getData("application/x-page-builder-catalog") as BlockType;
                      if (catType) {
                        handleAddBlock(catType, 0);
                      }
                      setDraggedCatalogType(null);
                    }}
                    className="py-20 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-400 transition-colors p-6"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Plus className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-800 text-lg">Your Canvas is Ready</h3>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                        Drag sections from the bar above or click one of the presets below to start building your custom page.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleAddBlock("hero")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
                      >
                        + Add Hero Section
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddBlock("features")}
                        className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                      >
                        + Add Features Grid
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddBlock("pricing")}
                        className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                      >
                        + Add Pricing Table
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Top drop zone */}
                    <CanvasDropZone
                      index={0}
                      isActive={dragOverIndex === 0}
                      onDragEnter={() => setDragOverIndex(0)}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDropBlock={(type) => {
                        handleAddBlock(type, 0);
                        setDragOverIndex(null);
                      }}
                      onReorderBlock={(sourceIdx) => {
                        handleReorder(sourceIdx, 0);
                      }}
                    />

                    {blocks.map((block, index) => {
                      const isSelected = block.id === selectedBlockId;
                      const catalogItem = BLOCK_CATALOG.find((b) => b.type === block.type);
                      const isBeingDragged = draggedBlockIndex === index;

                      return (
                        <React.Fragment key={block.id}>
                          <div
                            draggable={!isPreviewMode}
                            onDragStart={(e) => {
                              if (isPreviewMode) return;
                              e.dataTransfer.setData("application/x-page-builder-index", String(index));
                              setDraggedBlockIndex(index);
                            }}
                            onDragEnd={() => {
                              setDraggedBlockIndex(null);
                              setDragOverIndex(null);
                            }}
                            className={`group relative rounded-2xl transition-all ${
                              isBeingDragged ? "opacity-40 border-2 border-dashed border-emerald-500" : ""
                            } ${
                              isSelected
                                ? "ring-2 ring-emerald-500 shadow-lg bg-emerald-50/10"
                                : "hover:ring-1 hover:ring-slate-300"
                            }`}
                          >
                            {/* Block Control Header Bar */}
                            {!isPreviewMode && (
                              <div className="px-3 py-2 bg-slate-900 text-white rounded-t-xl flex items-center justify-between text-xs font-bold gap-2 select-none">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                    title="Drag section up/down to reorder"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-white/10 uppercase">
                                    #{index + 1} {catalogItem?.label || block.type}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveBlock(index, "up")}
                                    disabled={index === 0}
                                    className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white"
                                    title="Move Up"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveBlock(index, "down")}
                                    disabled={index === blocks.length - 1}
                                    className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white"
                                    title="Move Down"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateBlock(index)}
                                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                                    title="Duplicate Section"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedBlockId(block.id);
                                      setActiveTab("canvas");
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                      isSelected
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white/15 text-slate-200 hover:bg-white/25"
                                    }`}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBlock(block.id)}
                                    className="p-1.5 rounded hover:bg-rose-900 text-rose-300 hover:text-rose-100 ml-1"
                                    title="Delete Section"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Block Preview Content Container */}
                            <div className="relative p-2">
                              {/* Click-capture overlay in edit mode */}
                              {!isPreviewMode && (
                                <div
                                  onClick={() => {
                                    setSelectedBlockId(block.id);
                                    setActiveTab("canvas");
                                  }}
                                  className="absolute inset-0 z-10 cursor-pointer"
                                  title="Click to select & edit this section"
                                />
                              )}

                              {/* Actual rendered block */}
                              <div className={!isPreviewMode ? "select-none pointer-events-none" : ""}>
                                <PageBlockRenderer block={block} />
                              </div>
                            </div>
                          </div>

                          {/* Between Blocks Drop Zone & Insert Button */}
                          <div className="relative py-1">
                            <CanvasDropZone
                              index={index + 1}
                              isActive={dragOverIndex === index + 1}
                              onDragEnter={() => setDragOverIndex(index + 1)}
                              onDragLeave={() => setDragOverIndex(null)}
                              onDropBlock={(type) => {
                                handleAddBlock(type, index + 1);
                                setDragOverIndex(null);
                              }}
                              onReorderBlock={(sourceIdx) => {
                                handleReorder(sourceIdx, index + 1);
                              }}
                            />

                            {/* Hover Quick Insert Button */}
                            {!isPreviewMode && (
                              <div className="flex items-center justify-center my-1 group/insert">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setInsertPickerIndex(insertPickerIndex === index + 1 ? null : index + 1)
                                  }
                                  className="px-2.5 py-0.5 rounded-full border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 text-[10px] font-bold shadow-2xs opacity-40 group-hover/insert:opacity-100 transition-all flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3 text-emerald-600" />
                                  <span>Add Section Here</span>
                                </button>
                              </div>
                            )}

                            {/* Insert Block Dropdown Popover */}
                            {insertPickerIndex === index + 1 && (
                              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4 my-2 max-w-lg mx-auto z-20 relative animate-in fade-in zoom-in-95 duration-150">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                                  <h4 className="text-xs font-bold text-slate-800">
                                    Insert Section at #{index + 2}
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => setInsertPickerIndex(null)}
                                    className="p-1 rounded text-slate-400 hover:text-slate-700"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {BLOCK_CATALOG.map((b) => (
                                    <button
                                      key={b.type}
                                      type="button"
                                      onClick={() => handleAddBlock(b.type, index + 1)}
                                      className="p-2 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-left transition-all"
                                    >
                                      <p className="font-bold text-xs text-slate-800">{b.label}</p>
                                      <p className="text-[10px] text-slate-400 line-clamp-1">{b.description}</p>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {/* Footer mockup */}
                {styles.showFooter !== false && (
                  <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-slate-700">Footer Preview</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">Enabled</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT: PROPERTY INSPECTOR & SETTINGS (4 cols) */}
        {/* ==================================================== */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4 sticky top-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
            {/* Tabs Header */}
            <div className="flex items-center border-b border-slate-200 text-xs font-bold text-slate-600 bg-slate-50/70 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("canvas")}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "canvas"
                    ? "bg-white text-emerald-600 shadow-2xs font-extrabold"
                    : "hover:text-slate-900"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Edit Section</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("blocks")}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "blocks"
                    ? "bg-white text-emerald-600 shadow-2xs font-extrabold"
                    : "hover:text-slate-900"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>All Blocks</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "settings"
                    ? "bg-white text-emerald-600 shadow-2xs font-extrabold"
                    : "hover:text-slate-900"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </div>

            {/* TAB 1: ACTIVE BLOCK PROPERTIES */}
            {activeTab === "canvas" && (
              <div className="p-4 sm:p-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {!selectedBlock ? (
                  <div className="text-center py-16 space-y-2 text-slate-400">
                    <MousePointerClick className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-700">No Section Selected</p>
                    <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto">
                      Click any section in the canvas preview or add a new block from the "All Blocks" tab.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono tracking-wider">
                          Section Inspector
                        </span>
                        <h3 className="font-extrabold text-sm text-slate-900 capitalize">
                          {selectedBlock.type.replace("_", " ")}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(selectedBlock.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Block Property Controls */}
                    <BlockPropertyFields
                      block={selectedBlock}
                      onChange={(updatedContent) => updateSelectedBlockContent(updatedContent)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ALL BLOCKS PALETTE & TEMPLATES */}
            {activeTab === "blocks" && (
              <div className="p-4 sm:p-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Add Section
                    </h4>
                    <span className="text-[10px] text-slate-400">Drag or click</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {BLOCK_CATALOG.map((b) => {
                      const Icon = b.icon;
                      return (
                        <div
                          key={b.type}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData("application/x-page-builder-catalog", b.type);
                            setDraggedCatalogType(b.type);
                          }}
                          onDragEnd={() => setDraggedCatalogType(null)}
                          onClick={() => handleAddBlock(b.type)}
                          className="group p-2.5 rounded-xl border border-slate-200/90 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all flex items-start gap-3 shadow-2xs cursor-grab active:cursor-grabbing"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-600 flex items-center justify-center shrink-0 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                                {b.label}
                              </h5>
                              <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-emerald-500" />
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{b.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Starter Templates
                  </h4>
                  <div className="space-y-2">
                    {STARTER_TEMPLATES.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5"
                      >
                        <h5 className="font-bold text-xs text-slate-900">{tmpl.name}</h5>
                        <p className="text-[11px] text-slate-500 leading-snug">{tmpl.description}</p>
                        <button
                          type="button"
                          onClick={() => handleApplyTemplate(tmpl.id)}
                          className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors mt-1"
                        >
                          Load Template
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GLOBAL PAGE SETTINGS */}
            {activeTab === "settings" && (
              <div className="p-4 sm:p-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Page Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    URL Slug (Root Route)
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-[11px] font-mono">
                      /
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(generateSlug(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="DRAFT">DRAFT (Hidden from Public)</option>
                    <option value="PUBLISHED">PUBLISHED (Live at /{slug})</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Summary / Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description for preview cards..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs">SEO &amp; Social Meta</h4>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Title for Google search results..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Description for search engines..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs">Layout Options</h4>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={styles.showNavbar !== false}
                      onChange={(e) => setStyles((prev) => ({ ...prev, showNavbar: e.target.checked }))}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-medium text-slate-700">Show Global Navbar &amp; Topbar</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={styles.showFooter !== false}
                      onChange={(e) => setStyles((prev) => ({ ...prev, showFooter: e.target.checked }))}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-medium text-slate-700">Show Global Footer</span>
                  </label>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Max Width</label>
                    <select
                      value={styles.containerWidth || "max-w-7xl"}
                      onChange={(e) => setStyles((prev) => ({ ...prev, containerWidth: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                    >
                      <option value="max-w-4xl">Narrow (max-w-4xl)</option>
                      <option value="max-w-5xl">Medium (max-w-5xl)</option>
                      <option value="max-w-6xl">Large (max-w-6xl)</option>
                      <option value="max-w-7xl">Default Wide (max-w-7xl)</option>
                      <option value="max-w-full">Full Width (max-w-full)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// DROP ZONE COMPONENT FOR DRAG AND DROP
// ----------------------------------------------------------------------
function CanvasDropZone({
  index,
  isActive,
  onDragEnter,
  onDragLeave,
  onDropBlock,
  onReorderBlock,
}: {
  index: number;
  isActive: boolean;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDropBlock: (type: BlockType) => void;
  onReorderBlock: (sourceIdx: number) => void;
}) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        onDragEnter();
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        onDragLeave();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const catalogType = e.dataTransfer.getData("application/x-page-builder-catalog") as BlockType;
        const sourceIndexStr = e.dataTransfer.getData("application/x-page-builder-index");

        if (catalogType) {
          onDropBlock(catalogType);
        } else if (sourceIndexStr) {
          const sourceIdx = parseInt(sourceIndexStr, 10);
          if (!isNaN(sourceIdx)) {
            onReorderBlock(sourceIdx);
          }
        }
      }}
      className={`transition-all duration-150 rounded-xl ${
        isActive
          ? "h-14 border-2 border-dashed border-emerald-500 bg-emerald-50/60 flex items-center justify-center text-xs font-bold text-emerald-700"
          : "h-2 hover:h-4 opacity-0 hover:opacity-100 border border-dashed border-slate-300"
      }`}
    >
      {isActive && <span>Drop Section Here</span>}
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPREHENSIVE BLOCK PROPERTY INSPECTORS (ALL 13 TYPES)
// ----------------------------------------------------------------------
function BlockPropertyFields({
  block,
  onChange,
}: {
  block: PageBlock;
  onChange: (updatedContent: any) => void;
}) {
  const c = block.content as any;

  const update = (key: string, value: any) => {
    onChange({ ...c, [key]: value });
  };

  switch (block.type) {
    case "hero":
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Headline Title *</label>
            <textarea
              rows={2}
              value={c.title || ""}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Subtitle / Paragraph</label>
            <textarea
              rows={2}
              value={c.subtitle || ""}
              onChange={(e) => update("subtitle", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Badge Pill (Optional)</label>
            <input
              type="text"
              value={c.badge || ""}
              onChange={(e) => update("badge", e.target.value)}
              placeholder="e.g. Special Promotion"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Background Style</label>
              <select
                value={c.bgStyle || "gradient"}
                onChange={(e) => update("bgStyle", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="gradient">Clean Gradient</option>
                <option value="emerald">Emerald Vibrant</option>
                <option value="dark">Dark Luxury</option>
                <option value="light">Plain Light</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Alignment</label>
              <select
                value={c.align || "center"}
                onChange={(e) => update("align", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="center">Center</option>
                <option value="left">Left</option>
              </select>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="font-bold text-slate-800">Primary Button</p>
            <input
              type="text"
              value={c.primaryBtnText || ""}
              onChange={(e) => update("primaryBtnText", e.target.value)}
              placeholder="Button Label"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl mb-1"
            />
            <input
              type="text"
              value={c.primaryBtnUrl || ""}
              onChange={(e) => update("primaryBtnUrl", e.target.value)}
              placeholder="URL (e.g. /services)"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="font-bold text-slate-800">Secondary Button</p>
            <input
              type="text"
              value={c.secondaryBtnText || ""}
              onChange={(e) => update("secondaryBtnText", e.target.value)}
              placeholder="Button Label"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl mb-1"
            />
            <input
              type="text"
              value={c.secondaryBtnUrl || ""}
              onChange={(e) => update("secondaryBtnUrl", e.target.value)}
              placeholder="URL (e.g. /auth/register)"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="font-bold text-slate-800">Hero Metrics (Counters)</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={c.stat1Value || ""}
                onChange={(e) => update("stat1Value", e.target.value)}
                placeholder="Stat 1 Value (99.9%)"
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                value={c.stat1Label || ""}
                onChange={(e) => update("stat1Label", e.target.value)}
                placeholder="Stat 1 Label (Uptime)"
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                value={c.stat2Value || ""}
                onChange={(e) => update("stat2Value", e.target.value)}
                placeholder="Stat 2 Value (10M+)"
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                value={c.stat2Label || ""}
                onChange={(e) => update("stat2Label", e.target.value)}
                placeholder="Stat 2 Label (Orders)"
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      );

    case "heading_text":
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={c.title || ""}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Heading Tag</label>
              <select
                value={c.level || "h2"}
                onChange={(e) => update("level", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="h1">H1 (Hero Heading)</option>
                <option value="h2">H2 (Major Section)</option>
                <option value="h3">H3 (Sub Section)</option>
                <option value="h4">H4 (Small Heading)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Alignment</label>
              <select
                value={c.align || "left"}
                onChange={(e) => update("align", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={c.subtitle || ""}
              onChange={(e) => update("subtitle", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Body Text</label>
            <textarea
              rows={4}
              value={c.content || ""}
              onChange={(e) => update("content", e.target.value)}
              placeholder="Paragraph content..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>
      );

    case "features":
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Section Title</label>
            <input
              type="text"
              value={c.title || ""}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={c.subtitle || ""}
              onChange={(e) => update("subtitle", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Columns</label>
            <select
              value={c.columns || 3}
              onChange={(e) => update("columns", Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
            </select>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Feature Items ({(c.items || []).length})</span>
              <button
                type="button"
                onClick={() => {
                  const items = c.items || [];
                  update("items", [
                    ...items,
                    {
                      id: `feat-${Date.now()}`,
                      icon: "Zap",
                      title: "New Feature",
                      description: "Feature description...",
                      badge: "New",
                    },
                  ]);
                }}
                className="text-emerald-600 font-bold hover:underline"
              >
                + Add Feature
              </button>
            </div>
            <div className="space-y-2">
              {(c.items || []).map((item: any, idx: number) => (
                <div key={item.id || String(idx)} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, title: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      placeholder="Title"
                      className="font-bold bg-transparent text-slate-800 focus:outline-hidden w-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = c.items.filter((_: any, i: number) => i !== idx);
                        update("items", filtered);
                      }}
                      className="text-slate-400 hover:text-rose-600 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.description || ""}
                    onChange={(e) => {
                      const updated = c.items.map((it: any, i: number) =>
                        i === idx ? { ...it, description: e.target.value } : it
                      );
                      update("items", updated);
                    }}
                    placeholder="Description"
                    className="w-full text-slate-600 bg-transparent text-[11px] focus:outline-hidden"
                  />
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={item.icon || "Zap"}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, icon: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      placeholder="Icon (Zap, Shield)"
                      className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px]"
                    />
                    <input
                      type="text"
                      value={item.badge || ""}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, badge: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      placeholder="Badge"
                      className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "pricing":
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Section Title</label>
            <input
              type="text"
              value={c.title || ""}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={c.subtitle || ""}
              onChange={(e) => update("subtitle", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Tiers ({(c.items || []).length})</span>
              <button
                type="button"
                onClick={() => {
                  const items = c.items || [];
                  update("items", [
                    ...items,
                    {
                      id: `tier-${Date.now()}`,
                      name: "New Tier",
                      price: "$25",
                      period: "month",
                      isPopular: false,
                      features: ["Full API access", "Instant delivery"],
                      buttonText: "Order Now",
                      buttonUrl: "/auth/register",
                    },
                  ]);
                }}
                className="text-emerald-600 font-bold hover:underline"
              >
                + Add Tier
              </button>
            </div>
            <div className="space-y-3">
              {(c.items || []).map((tier: any, idx: number) => (
                <div key={tier.id || String(idx)} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={tier.name || ""}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, name: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      placeholder="Tier Name"
                      className="font-bold text-slate-900 bg-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = c.items.filter((_: any, i: number) => i !== idx);
                        update("items", filtered);
                      }}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tier.price || ""}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, price: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      placeholder="Price ($19)"
                      className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={tier.period || ""}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, period: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      placeholder="Period (month, one-time)"
                      className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tier.buttonText || ""}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, buttonText: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      placeholder="Button Text"
                      className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={tier.buttonUrl || ""}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, buttonUrl: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      placeholder="Button URL (/auth/register)"
                      className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={!!tier.isPopular}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, isPopular: e.target.checked } : it
                        );
                        update("items", updated);
                      }}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-semibold text-slate-700 text-[11px]">Most Popular Highlight</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "cta_banner":
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Banner Title *</label>
            <input
              type="text"
              value={c.title || ""}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={c.description || ""}
              onChange={(e) => update("description", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Theme</label>
              <select
                value={c.style || "emerald"}
                onChange={(e) => update("style", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="emerald">Emerald Gradient</option>
                <option value="dark">Dark Slate</option>
                <option value="clean">Clean White Bordered</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Badge</label>
              <input
                type="text"
                value={c.badge || ""}
                onChange={(e) => update("badge", e.target.value)}
                placeholder="Optional badge"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="font-bold text-slate-800">Primary Button</p>
            <input
              type="text"
              value={c.primaryBtnText || ""}
              onChange={(e) => update("primaryBtnText", e.target.value)}
              placeholder="Button Label"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
            <input
              type="text"
              value={c.primaryBtnUrl || ""}
              onChange={(e) => update("primaryBtnUrl", e.target.value)}
              placeholder="Button URL (/auth/register)"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="font-bold text-slate-800">Secondary Button</p>
            <input
              type="text"
              value={c.secondaryBtnText || ""}
              onChange={(e) => update("secondaryBtnText", e.target.value)}
              placeholder="Button Label"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
            <input
              type="text"
              value={c.secondaryBtnUrl || ""}
              onChange={(e) => update("secondaryBtnUrl", e.target.value)}
              placeholder="Button URL (/services)"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
            />
          </div>
        </div>
      );

    case "faq":
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">FAQ Section Title</label>
            <input
              type="text"
              value={c.title || ""}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={c.subtitle || ""}
              onChange={(e) => update("subtitle", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Q&amp;A Items ({(c.items || []).length})</span>
              <button
                type="button"
                onClick={() => {
                  const items = c.items || [];
                  update("items", [
                    ...items,
                    {
                      id: `faq-${Date.now()}`,
                      question: "New Question?",
                      answer: "Detailed answer goes here.",
                    },
                  ]);
                }}
                className="text-emerald-600 font-bold hover:underline"
              >
                + Add FAQ
              </button>
            </div>
            <div className="space-y-2">
              {(c.items || []).map((faq: any, idx: number) => (
                <div key={faq.id || String(idx)} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={faq.question || ""}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, question: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      placeholder="Question?"
                      className="font-bold text-slate-900 bg-transparent w-full text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = c.items.filter((_: any, i: number) => i !== idx);
                        update("items", filtered);
                      }}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={faq.answer || ""}
                    onChange={(e) => {
                      const updated = c.items.map((it: any, i: number) =>
                        i === idx ? { ...it, answer: e.target.value } : it
                      );
                      update("items", updated);
                    }}
                    placeholder="Answer..."
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "testimonials":
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Section Title</label>
            <input
              type="text"
              value={c.title || ""}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={c.subtitle || ""}
              onChange={(e) => update("subtitle", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Reviews ({(c.items || []).length})</span>
              <button
                type="button"
                onClick={() => {
                  const items = c.items || [];
                  update("items", [
                    ...items,
                    {
                      id: `test-${Date.now()}`,
                      name: "Client Name",
                      role: "Agency Owner",
                      rating: 5,
                      content: "Outstanding quality and service.",
                    },
                  ]);
                }}
                className="text-emerald-600 font-bold hover:underline"
              >
                + Add Review
              </button>
            </div>
            <div className="space-y-2">
              {(c.items || []).map((t: any, idx: number) => (
                <div key={t.id || String(idx)} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={t.name || ""}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, name: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      placeholder="Client Name"
                      className="font-bold text-slate-900 bg-transparent text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = c.items.filter((_: any, i: number) => i !== idx);
                        update("items", filtered);
                      }}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={t.role || ""}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, role: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      placeholder="Role (e.g. Reseller)"
                      className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <select
                      value={t.rating || 5}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, rating: Number(e.target.value) } : it
                        );
                        update("items", updated);
                      }}
                      className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    value={t.content || ""}
                    onChange={(e) => {
                      const updated = c.items.map((it: any, i: number) =>
                        i === idx ? { ...it, content: e.target.value } : it
                      );
                      update("items", updated);
                    }}
                    placeholder="Review quote..."
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "stats":
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Section Title</label>
            <input
              type="text"
              value={c.title || ""}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Counters ({(c.items || []).length})</span>
              <button
                type="button"
                onClick={() => {
                  const items = c.items || [];
                  update("items", [
                    ...items,
                    { id: `s-${Date.now()}`, value: "100K+", label: "Happy Clients" },
                  ]);
                }}
                className="text-emerald-600 font-bold hover:underline"
              >
                + Add Metric
              </button>
            </div>
            <div className="space-y-2">
              {(c.items || []).map((s: any, idx: number) => (
                <div key={s.id || String(idx)} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-2">
                  <input
                    type="text"
                    value={s.value || ""}
                    onChange={(e) => {
                      const updated = c.items.map((it: any, i: number) =>
                        i === idx ? { ...it, value: e.target.value } : it
                      );
                      update("items", updated);
                    }}
                    placeholder="Value (10M+)"
                    className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-emerald-700 text-xs"
                  />
                  <input
                    type="text"
                    value={s.label || ""}
                    onChange={(e) => {
                      const updated = c.items.map((it: any, i: number) =>
                        i === idx ? { ...it, label: e.target.value } : it
                      );
                      update("items", updated);
                    }}
                    placeholder="Label (Uptime)"
                    className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const filtered = c.items.filter((_: any, i: number) => i !== idx);
                      update("items", filtered);
                    }}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Image URL *</label>
            <input
              type="text"
              value={c.imageUrl || ""}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Caption</label>
            <input
              type="text"
              value={c.caption || ""}
              onChange={(e) => update("caption", e.target.value)}
              placeholder="Optional image caption"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Hyperlink Target URL</label>
            <input
              type="text"
              value={c.clickUrl || ""}
              onChange={(e) => update("clickUrl", e.target.value)}
              placeholder="e.g. /services"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
            />
          </div>
        </div>
      );

    case "video":
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Video Title</label>
            <input
              type="text"
              value={c.title || ""}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">YouTube / Vimeo URL *</label>
            <input
              type="text"
              value={c.videoUrl || ""}
              onChange={(e) => update("videoUrl", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Caption</label>
            <input
              type="text"
              value={c.caption || ""}
              onChange={(e) => update("caption", e.target.value)}
              placeholder="Video description or subtitle"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>
      );

    case "buttons":
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Alignment</label>
            <select
              value={c.align || "center"}
              onChange={(e) => update("align", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="center">Center</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Buttons ({(c.items || []).length})</span>
              <button
                type="button"
                onClick={() => {
                  const items = c.items || [];
                  update("items", [
                    ...items,
                    {
                      id: `btn-${Date.now()}`,
                      text: "New Button",
                      url: "/services",
                      variant: "primary",
                      size: "md",
                    },
                  ]);
                }}
                className="text-emerald-600 font-bold hover:underline"
              >
                + Add Button
              </button>
            </div>
            <div className="space-y-2">
              {(c.items || []).map((btn: any, idx: number) => (
                <div key={btn.id || String(idx)} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={btn.text || ""}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, text: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      placeholder="Button Label"
                      className="font-bold text-slate-900 bg-transparent text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = c.items.filter((_: any, i: number) => i !== idx);
                        update("items", filtered);
                      }}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={btn.url || ""}
                    onChange={(e) => {
                      const updated = c.items.map((it: any, i: number) =>
                        i === idx ? { ...it, url: e.target.value } : it
                      );
                      update("items", updated);
                    }}
                    placeholder="URL (/services)"
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <div className="flex gap-2">
                    <select
                      value={btn.variant || "primary"}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, variant: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="primary">Emerald Primary</option>
                      <option value="secondary">Dark Slate</option>
                      <option value="outline">Outline</option>
                      <option value="white">White</option>
                    </select>
                    <select
                      value={btn.size || "md"}
                      onChange={(e) => {
                        const updated = c.items.map((it: any, i: number) =>
                          i === idx ? { ...it, size: e.target.value } : it
                        );
                        update("items", updated);
                      }}
                      className="w-1/2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "divider":
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Divider Style</label>
            <select
              value={c.style || "solid"}
              onChange={(e) => update("style", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="solid">Solid Line</option>
              <option value="dashed">Dashed Line</option>
              <option value="dotted">Dotted Line</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Spacing Size</label>
            <select
              value={c.spacing || "md"}
              onChange={(e) => update("spacing", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="sm">Small (py-4)</option>
              <option value="md">Medium (py-8)</option>
              <option value="lg">Large (py-12)</option>
              <option value="xl">Extra Large (py-16)</option>
            </select>
          </div>
        </div>
      );

    case "custom_code":
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Widget Title</label>
            <input
              type="text"
              value={c.title || ""}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">HTML Embed Code</label>
            <textarea
              rows={6}
              value={c.html || ""}
              onChange={(e) => update("html", e.target.value)}
              placeholder="<div>Custom HTML here</div>"
              className="w-full px-3 py-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl"
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-2 text-xs">
          <p className="text-slate-500">Edit JSON content for this block:</p>
          <textarea
            rows={8}
            value={JSON.stringify(c, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch (err) {}
            }}
            className="w-full p-2.5 font-mono text-[11px] bg-slate-900 text-emerald-400 rounded-xl"
          />
        </div>
      );
  }
}
