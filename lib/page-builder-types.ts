export type BlockType =
  | "hero"
  | "heading_text"
  | "features"
  | "pricing"
  | "cta_banner"
  | "faq"
  | "testimonials"
  | "stats"
  | "image"
  | "video"
  | "buttons"
  | "divider"
  | "custom_code";

export interface HeroBlockContent {
  badge?: string;
  title: string;
  subtitle?: string;
  primaryBtnText?: string;
  primaryBtnUrl?: string;
  secondaryBtnText?: string;
  secondaryBtnUrl?: string;
  align?: "center" | "left";
  bgStyle?: "emerald" | "dark" | "gradient" | "light";
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
}

export interface HeadingTextBlockContent {
  level?: "h1" | "h2" | "h3" | "h4";
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  content?: string;
}

export interface FeatureItem {
  id: string;
  icon?: string;
  title: string;
  description: string;
  badge?: string;
}

export interface FeaturesBlockContent {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  items: FeatureItem[];
}

export interface PricingItem {
  id: string;
  name: string;
  price: string;
  period?: string;
  badge?: string;
  isPopular?: boolean;
  features: string[];
  buttonText?: string;
  buttonUrl?: string;
}

export interface PricingBlockContent {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3;
  items: PricingItem[];
}

export interface CtaBannerBlockContent {
  badge?: string;
  title: string;
  description?: string;
  primaryBtnText?: string;
  primaryBtnUrl?: string;
  secondaryBtnText?: string;
  secondaryBtnUrl?: string;
  style?: "emerald" | "dark" | "gradient" | "clean";
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqBlockContent {
  title?: string;
  subtitle?: string;
  items: FaqItem[];
}

export interface TestimonialItem {
  id: string;
  name: string;
  role?: string;
  rating?: number;
  content: string;
  avatarUrl?: string;
}

export interface TestimonialsBlockContent {
  title?: string;
  subtitle?: string;
  items: TestimonialItem[];
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  icon?: string;
}

export interface StatsBlockContent {
  title?: string;
  items: StatItem[];
}

export interface ImageBlockContent {
  imageUrl: string;
  altText?: string;
  caption?: string;
  aspectRatio?: "video" | "square" | "wide" | "auto";
  align?: "center" | "left" | "right";
  clickUrl?: string;
}

export interface VideoBlockContent {
  videoUrl: string;
  title?: string;
  caption?: string;
}

export interface ButtonItem {
  id: string;
  text: string;
  url: string;
  variant?: "primary" | "secondary" | "outline" | "white";
  size?: "sm" | "md" | "lg";
}

export interface ButtonsBlockContent {
  align?: "left" | "center" | "right";
  items: ButtonItem[];
}

export interface DividerBlockContent {
  style?: "solid" | "dashed" | "transparent";
  spacing?: "sm" | "md" | "lg";
}

export interface CustomCodeBlockContent {
  html: string;
  title?: string;
}

export type BlockContent =
  | HeroBlockContent
  | HeadingTextBlockContent
  | FeaturesBlockContent
  | PricingBlockContent
  | CtaBannerBlockContent
  | FaqBlockContent
  | TestimonialsBlockContent
  | StatsBlockContent
  | ImageBlockContent
  | VideoBlockContent
  | ButtonsBlockContent
  | DividerBlockContent
  | CustomCodeBlockContent
  | Record<string, any>;

export interface PageBlock {
  id: string;
  type: BlockType;
  content: BlockContent;
}

export interface PageStyles {
  containerWidth?: "max-w-4xl" | "max-w-5xl" | "max-w-6xl" | "max-w-7xl" | "max-w-full";
  bgColor?: "bg-slate-50" | "bg-white" | "bg-slate-900";
  showNavbar?: boolean;
  showFooter?: boolean;
}

export interface CustomPageData {
  id?: number;
  uuid?: string;
  title: string;
  slug: string;
  description?: string;
  blocks: PageBlock[];
  styles?: PageStyles;
  status: "DRAFT" | "PUBLISHED";
  meta_title?: string;
  meta_description?: string;
  views?: number;
  create_at?: string;
  update_at?: string;
}

// Starter templates
export const STARTER_TEMPLATES: {
  id: string;
  name: string;
  description: string;
  blocks: PageBlock[];
}[] = [
  {
    id: "landing_promo",
    name: "High-Converting Promo Landing",
    description: "Hero with CTA buttons, stats bar, 3-column features, and high-impact CTA banner.",
    blocks: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          badge: "Special Exclusive Promotion",
          title: "Scale Your Social Media Growth to 100K+ Today",
          subtitle:
            "Automated wholesale SMM services with instant delivery. Trusted by 25,000+ agencies and resellers worldwide.",
          primaryBtnText: "Explore VIP Services",
          primaryBtnUrl: "/services",
          secondaryBtnText: "Sign Up Free",
          secondaryBtnUrl: "/auth/register",
          align: "center",
          bgStyle: "gradient",
          stat1Value: "99.9%",
          stat1Label: "Success Rate",
          stat2Value: "10M+",
          stat2Label: "Orders Completed",
          stat3Value: "24/7",
          stat3Label: "Instant Support",
        },
      },
      {
        id: "features-1",
        type: "features",
        content: {
          title: "Why Resellers Choose Sociolizy",
          subtitle: "Enterprise-grade infrastructure designed for speed, stability, and profit margins.",
          columns: 3,
          items: [
            {
              id: "f-1",
              icon: "Zap",
              title: "Instant API Dispatch",
              description: "Zero manual intervention. Orders begin processing automatically in under 60 seconds.",
              badge: "Automated",
            },
            {
              id: "f-2",
              icon: "Shield",
              title: "100% Safe & High Retention",
              description: "Natural delivery algorithms protect account integrity and avoid drop-offs.",
              badge: "Verified",
            },
            {
              id: "f-3",
              icon: "Rocket",
              title: "Cheapest Wholesale Rates",
              description: "Direct server connections give you the lowest prices on the market to maximize your resale profits.",
              badge: "Best Rate",
            },
          ],
        },
      },
      {
        id: "cta-1",
        type: "cta_banner",
        content: {
          badge: "Limited Time Offer",
          title: "Ready to Supercharge Your Social Media Agency?",
          description:
            "Create your account in seconds and unlock wholesale SMM rates with zero initial deposit minimums.",
          primaryBtnText: "Get Started Now",
          primaryBtnUrl: "/auth/register",
          secondaryBtnText: "View Pricing Table",
          secondaryBtnUrl: "/services",
          style: "emerald",
        },
      },
    ],
  },
  {
    id: "pricing_showcase",
    name: "VIP Services & Pricing Showcase",
    description: "Header text, 3-tier pricing comparison cards, FAQ accordion, and action buttons.",
    blocks: [
      {
        id: "heading-1",
        type: "heading_text",
        content: {
          level: "h1",
          title: "VIP Tier Pricing Plans",
          subtitle: "Choose the package tailored to your reseller volume and scaling needs.",
          align: "center",
        },
      },
      {
        id: "pricing-1",
        type: "pricing",
        content: {
          title: "Transparent & Flexible Plans",
          subtitle: "Deposit once, spend at wholesale rates with no hidden fees or contracts.",
          columns: 3,
          items: [
            {
              id: "p-1",
              name: "Starter Reseller",
              price: "$10",
              period: "minimum deposit",
              badge: "For Beginners",
              isPopular: false,
              features: [
                "Full access to 1,000+ SMM services",
                "Instant order processing",
                "Standard API integration",
                "Email support response in 12h",
              ],
              buttonText: "Start with $10",
              buttonUrl: "/auth/register",
            },
            {
              id: "p-2",
              name: "Agency Pro",
              price: "$100",
              period: "deposit with 5% bonus",
              badge: "Most Popular",
              isPopular: true,
              features: [
                "Exclusive VIP wholesale discounts (10% off)",
                "High-speed dedicated API dispatch",
                "Priority support via Telegram & Ticket",
                "Automatic refill guarantee for 30 days",
                "Custom child panel setup support",
              ],
              buttonText: "Choose Agency Pro",
              buttonUrl: "/auth/register",
            },
            {
              id: "p-3",
              name: "Enterprise Wholesale",
              price: "$500+",
              period: "deposit with 10% bonus",
              badge: "Maximum Profit",
              isPopular: false,
              features: [
                "Lowest wholesale tier guaranteed",
                "Dedicated server queue for high volume",
                "Dedicated Account Manager 24/7",
                "Custom API endpoints & bulk webhooks",
                "White-label reseller solutions",
              ],
              buttonText: "Contact Sales",
              buttonUrl: "/page/contact-us",
            },
          ],
        },
      },
      {
        id: "faq-1",
        type: "faq",
        content: {
          title: "Frequently Asked Questions",
          subtitle: "Everything you need to know about deposits, delivery times, and service warranties.",
          items: [
            {
              id: "faq-item-1",
              question: "How fast are orders delivered?",
              answer:
                "Over 95% of orders start within 1 to 5 minutes after submission. Some large volume orders are dripped naturally over 12-24 hours for safety.",
            },
            {
              id: "faq-item-2",
              question: "What payment methods are supported?",
              answer:
                "We accept all major cryptocurrencies via Cryptomus (Bitcoin, USDT TRC20, Ethereum, Litecoin, etc.) and automated card options.",
            },
            {
              id: "faq-item-3",
              question: "Can I connect my own SMM panel via API?",
              answer:
                "Yes! Our REST API is 100% compatible with Standard SMM Panel formats (orders, status, balance, services list).",
            },
          ],
        },
      },
    ],
  },
  {
    id: "announcement_guide",
    name: "Product Announcement & Guide",
    description: "Rich announcement article layout with media banner, callouts, and testimonials.",
    blocks: [
      {
        id: "heading-2",
        type: "heading_text",
        content: {
          level: "h1",
          title: "Major Platform Update: Next-Gen SMM Delivery",
          subtitle: "Discover all the new features, speed upgrades, and security improvements launched this week.",
          align: "left",
        },
      },
      {
        id: "image-1",
        type: "image",
        content: {
          imageUrl:
            "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
          altText: "New Platform Dashboard Showcase",
          caption: "Our modernized order engine and live server dispatch monitoring.",
          aspectRatio: "video",
          align: "center",
        },
      },
      {
        id: "features-2",
        type: "features",
        content: {
          title: "Key Improvements in this Release",
          subtitle: "Built based on feedback from top resellers and agency partners.",
          columns: 2,
          items: [
            {
              id: "f-release-1",
              icon: "Zap",
              title: "3x Faster Response Times",
              description: "Optimized distributed server infrastructure reduces API latency to under 150ms.",
            },
            {
              id: "f-release-2",
              icon: "Check",
              title: "Automated Drop Protection",
              description: "Continuous health checking monitors follower counts and triggers automatic refill if drops occur.",
            },
          ],
        },
      },
      {
        id: "testimonials-1",
        type: "testimonials",
        content: {
          title: "What Our Resellers Say",
          subtitle: "Real feedback from entrepreneurs scaling with our infrastructure.",
          items: [
            {
              id: "t-1",
              name: "Alex Ramirez",
              role: "Digital Agency Director",
              rating: 5,
              content:
                "Switching our agency's clients to this panel doubled our delivery speed while saving us 30% in monthly SMM costs.",
            },
            {
              id: "t-2",
              name: "Sarah Chen",
              role: "Full-Time Reseller",
              rating: 5,
              content:
                "The API reliability is unmatched. We process over 1,500 orders every day with zero downtime.",
            },
          ],
        },
      },
    ],
  },
];

