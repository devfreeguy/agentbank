import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const KEY_WITH_QUOTE = 'Z6g64MTUvmib9Op3PFPQ47p8YjJQmnbV2ZJ7tPT8Bfc7TVxnHT"';
const KEY_WITHOUT_QUOTE = 'Z6g64MTUvmib9Op3PFPQ47p8YjJQmnbV2ZJ7tPT8Bfc7TVxnHT';
const ENV_KEY = process.env.AGENT_ENCRYPTION_KEY!;

console.log(`ENV_KEY is: >${ENV_KEY}<`);
console.log(`Match NO QUOTE? ${ENV_KEY === KEY_WITHOUT_QUOTE}`);
console.log(`Match QUOTE? ${ENV_KEY === KEY_WITH_QUOTE}`);

function deriveKey(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}

function decryptSeed(encryptedSeed: string, secret: string): string {
  const parts = encryptedSeed.split(":");
  const [ivHex, authTagHex, ciphertextHex] = parts;
  const key = deriveKey(secret);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

function encryptSeed(seedPhrase: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(seedPhrase, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext.toString("hex")}`;
}

async function main() {
  const { prisma } = await import("./src/lib/prisma");

  const agents = await prisma.agent.findMany();
  for (const agent of agents) {
    let worksWithQuote = false;
    let worksWithoutQuote = false;
    let rawSeed = "";
    try {
      rawSeed = decryptSeed(agent.encryptedSeedPhrase, KEY_WITH_QUOTE);
      worksWithQuote = true;
    } catch (e) {}

    try {
      rawSeed = decryptSeed(agent.encryptedSeedPhrase, KEY_WITHOUT_QUOTE);
      worksWithoutQuote = true;
    } catch (e) {}

    console.log(`Agent ${agent.id} (created ${agent.createdAt.toISOString()}):`);
    console.log(`  - Decrypts with quote? ${worksWithQuote}`);
    console.log(`  - Decrypts without quote? ${worksWithoutQuote}`);

    if (worksWithQuote && !worksWithoutQuote) {
      // Migrate it to KEY_WITHOUT_QUOTE (the intended key)
      const migrated = encryptSeed(rawSeed, KEY_WITHOUT_QUOTE);
      await prisma.agent.update({ where: { id: agent.id }, data: { encryptedSeedPhrase: migrated } });
      console.log(`  => Migrated to target key without quote!`);
    }
  }

  await prisma.$disconnect();
}

main();
