import "dotenv/config";
import { prisma } from "../lib/prisma";
import { STARTER_TEMPLATES } from "../lib/page-builder-types";

async function main() {
  console.log("Seeding sample custom pages...");

  // 1. VIP Reseller Promotion Page
  const promoPage = await prisma.customPage.upsert({
    where: { slug: "vip-reseller-promo" },
    update: {},
    create: {
      title: "VIP Reseller Special Promotion 2026",
      slug: "vip-reseller-promo",
      description: "Exclusive wholesale discounts and dedicated server lanes for high-volume SMM agencies.",
      status: "PUBLISHED",
      meta_title: "VIP Reseller Special Promotion 2026 | Sociolizy",
      meta_description: "Unlock up to 15% bonus balance and instant API server lines with our exclusive VIP reseller promotion.",
      blocks: STARTER_TEMPLATES[0].blocks as any,
      styles: {
        containerWidth: "max-w-7xl",
        bgColor: "bg-slate-50",
        showNavbar: true,
        showFooter: true,
      },
    },
  });

  console.log("Created promo page:", promoPage.title, "-> /" + promoPage.slug);

  // 2. VIP Pricing & Service Comparison
  const pricingPage = await prisma.customPage.upsert({
    where: { slug: "vip-pricing-plans" },
    update: {},
    create: {
      title: "VIP Tier Pricing & Volume Plans",
      slug: "vip-pricing-plans",
      description: "Compare reseller volume tiers, discount margins, and dedicated support packages.",
      status: "PUBLISHED",
      meta_title: "VIP Tier Pricing & Volume Plans | Sociolizy",
      meta_description: "Transparent volume tiers designed for entrepreneurs scaling digital social media marketing agencies.",
      blocks: STARTER_TEMPLATES[1].blocks as any,
      styles: {
        containerWidth: "max-w-6xl",
        bgColor: "bg-white",
        showNavbar: true,
        showFooter: true,
      },
    },
  });

  console.log("Created pricing page:", pricingPage.title, "-> /" + pricingPage.slug);

  console.log("Page builder seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
