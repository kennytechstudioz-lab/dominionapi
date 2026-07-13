/**
 * One-off migration: Replace "Capricorn Energy Ltd" / "Capricorn Energy Limited"
 * with "Dominion Group" in FAQ, Terms, and Blog records.
 *
 * Run from the api directory:
 *   npx ts-node src/scripts/migrateCompanyName.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { Blog } from "../models/Blog";
import { Faq } from "../models/Faq";
import { Term } from "../models/Term";

const OLD_NAMES = /Capricorn Energy Lim?ited?/gi;
const NEW_NAME = "Dominion Group";

function replaceCompanyName(text: string): string {
  return text.replace(OLD_NAMES, NEW_NAME);
}

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("✅ Connected to MongoDB");

  // ── FAQ ────────────────────────────────────────────────────────────────────
  const faqs = await Faq.find({});
  let faqCount = 0;
  for (const faq of faqs) {
    const newQ = replaceCompanyName(faq.question || "");
    const newA = replaceCompanyName(faq.answer || "");
    if (newQ !== faq.question || newA !== faq.answer) {
      faq.question = newQ;
      faq.answer = newA;
      await faq.save();
      faqCount++;
    }
  }
  console.log(`✅ FAQ: updated ${faqCount} / ${faqs.length} records`);

  // ── TERMS ──────────────────────────────────────────────────────────────────
  const terms = await Term.find({});
  let termCount = 0;
  for (const term of terms) {
    const newContent = replaceCompanyName((term as any).content || "");
    if (newContent !== (term as any).content) {
      (term as any).content = newContent;
      await term.save();
      termCount++;
    }
  }
  console.log(`✅ Terms: updated ${termCount} / ${terms.length} records`);

  // ── BLOGS ──────────────────────────────────────────────────────────────────
  const blogs = await Blog.find({});
  let blogCount = 0;
  for (const blog of blogs) {
    const newTitle = replaceCompanyName(blog.title || "");
    const newContent = replaceCompanyName(blog.content || "");
    const newSubtitle = replaceCompanyName(blog.subtitle || "");
    let changed = false;
    if (newTitle !== blog.title) { blog.title = newTitle; changed = true; }
    if (newContent !== blog.content) { blog.content = newContent; changed = true; }
    if (newSubtitle !== blog.subtitle) { blog.subtitle = newSubtitle; changed = true; }
    if (changed) { await blog.save(); blogCount++; }
  }
  console.log(`✅ Blogs: updated ${blogCount} / ${blogs.length} records`);

  await mongoose.disconnect();
  console.log("✅ Migration complete. Connection closed.");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
