import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

// The key with the trailing quote that dotenv likely parsed
const OLD_KEY = 'Z6g64MTUvmib9Op3PFPQ47p8YjJQmnbV2ZJ7tPT8Bfc7TVxnHT"';
const NEW_KEY = process.env.AGENT_ENCRYPTION_KEY!; // The corrected key

function deriveKey(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}

function decryptSeed(encryptedSeed: string, secret: string): string {
  const parts = encryptedSeed.split(":");
  if (parts.length !== 3) {
    throw new Error(`Invalid encrypted seed format: expected 3 parts separated by ':', got ${parts.length}`);
  }
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

  const agentId = "cmmrux7aj00031suc4anl3rw5";
  const agent = await prisma.agent.findUnique({
    where: { id: agentId }
  });

  if (!agent) {
    console.log("Agent not found.");
    return;
  }

  let rawSeed: string | null = null;

  try {
    rawSeed = decryptSeed(agent.encryptedSeedPhrase, OLD_KEY);
    console.log(`✅ Successfully decrypted the old agent's seed using the key with the trailing quote!`);
  } catch (e) {
    console.error("❌ Failed to decrypt with the typoed key.");
  }

  if (rawSeed) {
    // Migrate to new key
    try {
       decryptSeed(agent.encryptedSeedPhrase, NEW_KEY);
       console.log("Agent already decrypts with the new key (already migrated).");
    } catch {
       const newEncrypted = encryptSeed(rawSeed, NEW_KEY);
       await prisma.agent.update({
         where: { id: agentId },
         data: { encryptedSeedPhrase: newEncrypted }
       });
       console.log("✅ Successfully re-encrypted the seed with the correct NEW key and updated the database!");
    }
  }

  await prisma.$disconnect();
}

main();
