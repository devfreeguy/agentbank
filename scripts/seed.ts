import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import WDK from "@tetherto/wdk";
import WalletManagerEvm from "@tetherto/wdk-wallet-evm";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const KEY = process.env.AGENT_ENCRYPTION_KEY!;
const POLYGON_RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC!;

function deriveKey(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptSeed(seedPhrase: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(seedPhrase, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext.toString("hex")}`;
}

async function createAgentWallet() {
  const seedPhrase = WDK.getRandomSeedPhrase();
  const wdk = new WDK(seedPhrase).registerWallet("polygon", WalletManagerEvm, {
    provider: POLYGON_RPC_URL,
  });
  const account = await wdk.getAccount("polygon", 0);
  const address = await account.getAddress();
  account.dispose();
  wdk.dispose();

  const encryptedSeed = encryptSeed(seedPhrase, KEY);
  return { address, encryptedSeed };
}

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const { Role } = await import("../src/generated/prisma/enums");
  
  console.log("Wiping Database for a Clean Seed...");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User", "Agent", "Job", "AgentTransaction", "SubAgentJob", "Category", "Subcategory" CASCADE;`);

  // 1. Create Base Categories
  console.log("Creating categories...");
  const catDev = await prisma.category.create({
    data: { name: "Code Snippets & Utilities", slug: "code-utilities", description: "Small development tasks and code fixes" }
  });
  const catContent = await prisma.category.create({
    data: { name: "Everyday Writing", slug: "everyday-writing", description: "Emails, social media, and short copy" }
  });
  const catResearch = await prisma.category.create({
    data: { name: "Fact & Data Polish", slug: "fact-data", description: "Formatting data and quick web summaries" }
  });
  const catManagement = await prisma.category.create({
    data: { name: "Task Automation", slug: "task-automation", description: "Simple delegation and combined tasks" }
  });
  const catDesign = await prisma.category.create({
    data: { name: "Design Micro-Tasks", slug: "design-micro", description: "Color palettes, CSS fixes, and quick ideas" }
  });

  // 2. Create Platform Owner User
  console.log("Creating owner...");
  const ownerAddress = process.env.PLATFORM_BILLING_ADDRESS || "0xA2a4fF50690a06c83786B0FB1eBd07AE4F636B40";
  const owner = await prisma.user.upsert({
    where: { walletAddress: ownerAddress },
    update: {},
    create: {
      walletAddress: ownerAddress,
      role: Role.OWNER,
      onboarded: true
    }
  });

  // 3. Define Seed Agents (20 Practical MVP Purposes)
  const seedAgents = [
    // --- DEVELOPER MICRO-TASKS ---
    {
      name: "Regex Generator",
      categories: [catDev.id],
      priceUsdt: 1.0,
      prompt: "You are a Regular Expression specialist. Write and explain a short RegEx snippet to format or extract specific text patterns based on the user's requirements."
    },
    {
      name: "JSDoc Commenter",
      categories: [catDev.id],
      priceUsdt: 1.5,
      prompt: "You read JavaScript or TypeScript functions and output them with properly formatted, highly detailed JSDoc comment blocks."
    },
    {
      name: "Tailwind CSS Fixer",
      categories: [catDev.id, catDesign.id],
      priceUsdt: 2.0,
      prompt: "You debug and write Tailwind CSS utility classes. If a user asks how to center a div or make a grid responsive, give them the exact 1-line HTML snippet."
    },
    {
      name: "JSON Formatter",
      categories: [catDev.id],
      priceUsdt: 0.5,
      prompt: "You take messy, unformatted data and cleanly format it into valid, strictly-typed JSON. If there are syntax errors, fix them automatically."
    },
    {
      name: "SQL Query Writer",
      categories: [catDev.id],
      priceUsdt: 3.0,
      prompt: "You write basic to medium SQL queries (SELECT, JOIN, GROUP BY). Given a schema or table concepts, provide the exact query string they need."
    },

    // --- DESIGN MICRO-TASKS ---
    {
      name: "Color Palette Generator",
      categories: [catDesign.id],
      priceUsdt: 1.0,
      prompt: "You suggest aesthetically pleasing color palettes. Provide 5 distinct HEX codes with names (Primary, Secondary, Accent, Background, Text) based on the user's requested vibe."
    },
    {
      name: "CSS Animation Expert",
      categories: [catDesign.id, catDev.id],
      priceUsdt: 2.5,
      prompt: "You write small, lightweight CSS animations (keyframes). Provide the raw CSS code to animate a button, text, or loading spinner."
    },
    {
      name: "Logo Concept Ideator",
      categories: [catDesign.id],
      priceUsdt: 1.5,
      prompt: "You brainstorm 3 distinct textual descriptions for a logo based on a brand name and industry. Do not generate an image, just describe the visual concepts clearly."
    },

    // --- WRITING MICRO-TASKS ---
    {
      name: "Professional Email Drafter",
      categories: [catContent.id],
      priceUsdt: 2.0,
      prompt: "You take bullet points of what a user wants to say and turn it into a polite, professional corporate email."
    },
    {
      name: "Grammar & Tone Polisher",
      categories: [catContent.id],
      priceUsdt: 1.0,
      prompt: "You fix typos, grammatical errors, and awkward phrasing in text. Improve the flow while keeping the original meaning."
    },
    {
      name: "Tweet Thread Creator",
      categories: [catContent.id],
      priceUsdt: 3.0,
      prompt: "You turn an idea or paragraph into a highly engaging, 3-part Twitter thread. Use formatting and relevant emojis."
    },
    {
      name: "SEO Meta Description Writer",
      categories: [catContent.id],
      priceUsdt: 1.5,
      prompt: "You write extremely concise SEO meta descriptions (under 160 characters) based on the topic provided."
    },
    {
      name: "Product Description Writer",
      categories: [catContent.id],
      priceUsdt: 2.5,
      prompt: "You write catchy, 2-paragraph descriptions for e-commerce products highlighting their features and benefits."
    },

    // --- RESEARCH / DATA MICRO-TASKS ---
    {
      name: "Markdown Table Formatter",
      categories: [catResearch.id],
      priceUsdt: 1.0,
      prompt: "You convert raw lists, facts, or comma-separated values into a beautifully aligned Markdown table."
    },
    {
      name: "Article Summarizer",
      categories: [catResearch.id],
      priceUsdt: 1.5,
      prompt: "You summarize long blocks of text into 3 key bullet points."
    },
    {
      name: "Competitor Feature Researcher",
      categories: [catResearch.id],
      priceUsdt: 4.0,
      prompt: "You identify standard features expected in common software tools. When asked about competitors in a space, list 5 features they usually have."
    },
    {
      name: "Quick Fact Checker",
      categories: [catResearch.id],
      priceUsdt: 2.0,
      prompt: "You verify common facts or statements. State whether the premise is True or False, followed by a 1-sentence explanation."
    },

    // --- SIMPLE ORCHESTRATORS (Delegating minor tasks) ---
    {
      name: "Blog Post Orchestrator",
      categories: [catManagement.id, catContent.id],
      priceUsdt: 6.0,
      prompt: `You orchestrate the creation of a simple blog post. 
If the user gives you a topic, delegate the 'Outline creation' to a Research agent or 'Writing' to a Copywriter agent. 
Combine their output into a neat Markdown file.`
    },
    {
      name: "Landing Page Copy Maker",
      categories: [catManagement.id, catDesign.id, catContent.id],
      priceUsdt: 7.0,
      prompt: `You handle simple landing page copy. 
Delegate 'Headline Writing' to a Copywriter and 'Color Palette' to a Designer. 
Then, present the user with the complete headline, CTA, and color hex codes.`
    },
    {
      name: "Newsletter Compiler",
      categories: [catManagement.id, catContent.id],
      priceUsdt: 5.0,
      prompt: `You compile a weekly newsletter. 
Delegate tasks like 'Summarize news' or 'Draft Intro Email' to specific writing/research sub-agents. 
Output the final newsletter format.`
    }
  ];

  // 4. Generate Wallets and Insert Agents
  console.log(`Generating ${seedAgents.length} practical MVP agents. This will take a moment...`);
  let count = 1;

  for (const agentDef of seedAgents) {
    const { address, encryptedSeed } = await createAgentWallet();
    
    await prisma.agent.create({
      data: {
        ownerId: owner.id,
        name: agentDef.name,
        systemPrompt: agentDef.prompt,
        pricePerTask: agentDef.priceUsdt,
        categoryIds: agentDef.categories,
        walletAddress: address,
        encryptedSeedPhrase: encryptedSeed,
        status: "ACTIVE"
      }
    });
    console.log(`[${count}/${seedAgents.length}] Created agent: ${agentDef.name} (${address})`);
    count++;
  }

  console.log("Database wiped and seeded successfully with 20 MVP-scoped agents!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
