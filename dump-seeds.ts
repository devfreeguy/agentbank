import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const KEY = process.env.AGENT_ENCRYPTION_KEY!;

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

async function main() {
  const { prisma } = await import("./src/lib/prisma");

  const agents = await prisma.agent.findMany({
    select: { id: true, name: true, walletAddress: true, encryptedSeedPhrase: true }
  });

  console.log(`\n==============================================`);
  console.log(`FOUND ${agents.length} AGENT WALLETS IN THE DATABASE`);
  console.log(`==============================================\n`);

  for (const agent of agents) {
    let rawSeed = "ERROR: Failed to decrypt";
    try {
      rawSeed = decryptSeed(agent.encryptedSeedPhrase, KEY);
    } catch (e) {
      // In case they have an unrecoverable agent
    }

    console.log(`Agent Name:     ${agent.name}`);
    console.log(`Agent ID:       ${agent.id}`);
    console.log(`Wallet Address: ${agent.walletAddress}`);
    console.log(`Seed Phrase:    \x1b[32m${rawSeed}\x1b[0m`);
    console.log(`----------------------------------------------`);
  }

  await prisma.$disconnect();
}

main();
