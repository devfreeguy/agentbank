import WDK from "@tetherto/wdk";
import WalletManagerEvm, { WalletAccountReadOnlyEvm } from "@tetherto/wdk-wallet-evm";
import { WdkSecretManager, wdkSaltGenerator } from "@tetherto/wdk-secret-manager";

import { POLYGON_RPC_URL } from "@/constants/chains";
import { USDT_CONTRACT_ADDRESS, USDT_DECIMALS } from "@/constants/contracts";
import { prisma } from "@/lib/prisma";
import { pollForPayment } from "@/lib/indexer";

// ─── Encryption helpers ────────────────────────────────────────────────────────

async function encryptSeedPhrase(seedPhrase: string): Promise<string> {
  const salt = wdkSaltGenerator.generate();
  const secretManager = new WdkSecretManager(process.env.AGENT_ENCRYPTION_KEY!, salt);
  const entropy = secretManager.mnemonicToEntropy(seedPhrase);
  const { encryptedEntropy } = await secretManager.generateAndEncrypt(entropy);
  secretManager.dispose();
  return `${salt.toString("hex")}:${encryptedEntropy.toString("hex")}`;
}

export async function decryptAgentSeed(encryptedSeed: string): Promise<string> {
  try {
    const [saltHex, entropyHex] = encryptedSeed.split(":");
    if (!saltHex || !entropyHex) {
      throw new Error("Invalid encrypted seed format");
    }
    const salt = Buffer.from(saltHex, "hex");
    const encryptedEntropy = Buffer.from(entropyHex, "hex");
    const secretManager = new WdkSecretManager(process.env.AGENT_ENCRYPTION_KEY!, salt);
    const entropyBuffer = secretManager.decrypt(encryptedEntropy);
    const seedPhrase = secretManager.entropyToMnemonic(entropyBuffer);
    secretManager.dispose();
    return seedPhrase;
  } catch (error) {
    throw new Error(
      `decryptAgentSeed failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// ─── Wallet creation ──────────────────────────────────────────────────────────

export async function createAgentWallet(): Promise<{
  address: string;
  encryptedSeed: string;
}> {
  try {
    const seedPhrase = WDK.getRandomSeedPhrase();
    const wdk = new WDK(seedPhrase).registerWallet("polygon", WalletManagerEvm, {
      provider: POLYGON_RPC_URL,
    });

    const account = await wdk.getAccount("polygon", 0);
    const address = await account.getAddress();
    account.dispose();
    wdk.dispose();

    const encryptedSeed = await encryptSeedPhrase(seedPhrase);
    return { address, encryptedSeed };
  } catch (error) {
    throw new Error(
      `createAgentWallet failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// ─── Balance ──────────────────────────────────────────────────────────────────

export async function getAgentBalance(walletAddress: string): Promise<string> {
  try {
    const readOnly = new WalletAccountReadOnlyEvm(walletAddress, {
      provider: POLYGON_RPC_URL,
    });
    const balanceBigInt = await readOnly.getTokenBalance(USDT_CONTRACT_ADDRESS);
    const balance = (Number(balanceBigInt) / 10 ** USDT_DECIMALS).toFixed(6);
    return balance;
  } catch (error) {
    throw new Error(
      `getAgentBalance failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// ─── Send USDT ────────────────────────────────────────────────────────────────

export async function sendUsdt(
  fromAgentId: string,
  toAddress: string,
  amountUsdt: string
): Promise<{ txHash: string }> {
  try {
    const agent = await prisma.agent.findUniqueOrThrow({
      where: { id: fromAgentId },
      select: { encryptedSeedPhrase: true },
    });

    const seedPhrase = await decryptAgentSeed(agent.encryptedSeedPhrase);
    const amountBaseUnits = BigInt(Math.round(parseFloat(amountUsdt) * 10 ** USDT_DECIMALS));

    const wdk = new WDK(seedPhrase).registerWallet("polygon", WalletManagerEvm, {
      provider: POLYGON_RPC_URL,
    });

    const account = await wdk.getAccount("polygon", 0);
    const result = await account.transfer({
      token: USDT_CONTRACT_ADDRESS,
      recipient: toAddress,
      amount: amountBaseUnits,
    });

    account.dispose();
    wdk.dispose();

    return { txHash: result.hash };
  } catch (error) {
    throw new Error(
      `sendUsdt failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// ─── Payment verification ─────────────────────────────────────────────────────

export async function verifyPayment(
  walletAddress: string,
  expectedAmountUsdt: string,
  afterTimestamp: number
): Promise<{ confirmed: boolean; txHash?: string }> {
  try {
    const result = await pollForPayment(walletAddress, expectedAmountUsdt, afterTimestamp);
    if (result) {
      return { confirmed: true, txHash: result.txHash };
    }
    return { confirmed: false };
  } catch (error) {
    throw new Error(
      `verifyPayment failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
