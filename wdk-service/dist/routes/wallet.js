"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletRouter = void 0;
const crypto_1 = __importDefault(require("crypto"));
const express_1 = require("express");
const wdk_1 = __importDefault(require("@tetherto/wdk"));
const wdk_wallet_evm_1 = __importDefault(require("@tetherto/wdk-wallet-evm"));
const router = (0, express_1.Router)();
exports.walletRouter = router;
const POLYGON_RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC;
const USDT_CONTRACT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const USDT_DECIMALS = 6;
const INDEXER_BASE_URL = "https://wdk-api.tether.io";
// Fallback gas config used when the Polygon gas station times out
const POLYGON_GAS_CONFIG = {
    provider: POLYGON_RPC_URL,
    gasPrice: 50000000000n, // 50 gwei
    transferMaxFee: 1000000000000000n, // max fee cap
};
const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;
// Carries an HTTP status so the outer handler can forward the right code
class WdkError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = "WdkError";
    }
}
function classifyTransferError(raw) {
    const lower = raw.toLowerCase();
    if (lower.includes("insufficient funds") ||
        (lower.includes("insufficient") && (lower.includes("gas") || lower.includes("native") || lower.includes("matic")))) {
        return new WdkError("Insufficient MATIC for gas fees. Send a small amount of MATIC (0.01+) to the agent wallet address to cover transaction fees.", 400);
    }
    if (lower.includes("execution reverted") ||
        (lower.includes("insufficient") && (lower.includes("balance") || lower.includes("token") || lower.includes("usdt") || lower.includes("erc20")))) {
        return new WdkError("Insufficient USDT balance. Agent wallet does not have enough USDT to cover this withdrawal.", 400);
    }
    if (lower.includes("user rejected") || lower.includes("rejected") || lower.includes("denied")) {
        return new WdkError("Transaction rejected.", 400);
    }
    if (lower.includes("timeout") || lower.includes("gas station") || lower.includes("congested")) {
        return new WdkError("Polygon network is congested. Please try again in a few seconds.", 503);
    }
    if (lower.includes("fetch") || lower.includes("network") || lower.includes("econnrefused") || lower.includes("etimedout")) {
        return new WdkError("Could not reach Polygon network. Check your internet connection and try again.", 503);
    }
    return new WdkError(`Transaction failed: ${raw}`, 500);
}
function indexerHeaders() {
    return { "x-api-key": process.env.WDK_INDEXER_API_KEY };
}
function deriveKey() {
    return crypto_1.default.createHash("sha256").update(process.env.AGENT_ENCRYPTION_KEY).digest();
}
// Format: iv_hex:auth_tag_hex:ciphertext_hex
function encryptSeed(seedPhrase) {
    const key = deriveKey();
    console.log("[encrypt] derived key (first 4 bytes):", key.slice(0, 4).toString("hex"));
    console.log("[encrypt] derived key (first 4 bytes):", crypto_1.default.createHash("sha256").update(process.env.AGENT_ENCRYPTION_KEY).digest().slice(0, 4).toString("hex"));
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(seedPhrase, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const result = `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext.toString("hex")}`;
    console.log("[encrypt] iv length:", iv.toString("hex").length, "authTag length:", authTag.toString("hex").length, "ciphertext length:", ciphertext.toString("hex").length);
    return result;
}
function decryptSeed(encryptedSeed) {
    const parts = encryptedSeed.split(":");
    if (parts.length !== 3) {
        throw new Error(`Invalid encrypted seed format: expected 3 parts separated by ':', got ${parts.length}`);
    }
    const [ivHex, authTagHex, ciphertextHex] = parts;
    console.log("[decrypt] iv length:", ivHex.length, "(expect 24)");
    console.log("[decrypt] authTag length:", authTagHex.length, "(expect 32)");
    console.log("[decrypt] ciphertext length:", ciphertextHex.length);
    if (!ivHex || !authTagHex || !ciphertextHex)
        throw new Error("Invalid encrypted seed format: one or more parts are empty");
    const key = deriveKey();
    console.log("[decrypt] derived key (first 4 bytes):", key.slice(0, 4).toString("hex"));
    const decipher = crypto_1.default.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
    // setAuthTag MUST be called before update/final
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    return Buffer.concat([
        decipher.update(Buffer.from(ciphertextHex, "hex")),
        decipher.final(),
    ]).toString("utf8");
}
// POST /wallet/create
router.post("/create", async (_req, res) => {
    try {
        const seedPhrase = wdk_1.default.getRandomSeedPhrase();
        const wdk = new wdk_1.default(seedPhrase).registerWallet("polygon", wdk_wallet_evm_1.default, {
            provider: POLYGON_RPC_URL,
        });
        const account = await wdk.getAccount("polygon", 0);
        const address = await account.getAddress();
        account.dispose();
        wdk.dispose();
        const encryptedSeed = encryptSeed(seedPhrase);
        res.json({ address, encryptedSeed });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Wallet creation failed" });
    }
});
// POST /wallet/send
router.post("/send", async (req, res) => {
    const { fromEncryptedSeed, toAddress, amountUsdt } = req.body;
    if (!fromEncryptedSeed || !toAddress || !amountUsdt) {
        res.status(400).json({ error: "fromEncryptedSeed, toAddress, and amountUsdt are required" });
        return;
    }
    console.log("[decrypt] encryptedSeed length:", fromEncryptedSeed.length);
    console.log("[decrypt] encryptedSeed preview:", fromEncryptedSeed.slice(0, 40));
    try {
        // Decrypt — failure here is a system error, not a user error
        let seedPhrase;
        try {
            seedPhrase = decryptSeed(fromEncryptedSeed);
        }
        catch {
            throw new WdkError("Could not decrypt agent wallet. Contact support.", 500);
        }
        const amountBaseUnits = BigInt(Math.round(parseFloat(amountUsdt) * 10 ** USDT_DECIMALS));
        const transferPayload = {
            token: USDT_CONTRACT_ADDRESS,
            recipient: toAddress,
            amount: amountBaseUnits,
        };
        let result;
        try {
            // First attempt: let WDK fetch gas price from gas station
            const wdk = new wdk_1.default(seedPhrase).registerWallet("polygon", wdk_wallet_evm_1.default, {
                provider: POLYGON_RPC_URL,
            });
            const account = await wdk.getAccount("polygon", 0);
            result = await account.transfer(transferPayload);
            account.dispose();
            wdk.dispose();
        }
        catch (firstErr) {
            const msg = firstErr instanceof Error ? firstErr.message : String(firstErr);
            const lower = msg.toLowerCase();
            // Only retry transient gas station / network errors, not balance or rejection errors
            const isRetryable = (lower.includes("gas") && !lower.includes("insufficient funds")) ||
                lower.includes("timeout") ||
                lower.includes("fetch") ||
                lower.includes("network") ||
                lower.includes("etimedout");
            if (!isRetryable) {
                throw classifyTransferError(msg);
            }
            // Retry with hardcoded gas config
            console.warn("[send] network/gas station error, retrying with fallback gas config:", msg);
            try {
                const wdk2 = new wdk_1.default(seedPhrase).registerWallet("polygon", wdk_wallet_evm_1.default, POLYGON_GAS_CONFIG);
                const account2 = await wdk2.getAccount("polygon", 0);
                result = await account2.transfer(transferPayload);
                account2.dispose();
                wdk2.dispose();
            }
            catch (retryErr) {
                throw classifyTransferError(retryErr instanceof Error ? retryErr.message : String(retryErr));
            }
        }
        res.json({ txHash: result.hash });
    }
    catch (error) {
        if (error instanceof WdkError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            const msg = error instanceof Error ? error.message : "Send failed";
            res.status(500).json({ error: `Transaction failed: ${msg}` });
        }
    }
});
// GET /wallet/balance/:address
router.get("/balance/:address", async (req, res) => {
    const address = req.params.address;
    if (typeof address !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
        res.status(400).json({ error: "Invalid wallet address format." });
        return;
    }
    try {
        const url = `${INDEXER_BASE_URL}/api/v1/polygon/usdt/${address}/token-balances`;
        const indexerRes = await fetch(url, { headers: indexerHeaders() });
        if (!indexerRes.ok) {
            res.status(502).json({ error: "Could not fetch wallet balance. Check your network connection." });
            return;
        }
        const data = (await indexerRes.json());
        res.json({ balance: data.tokenBalance.amount, address });
    }
    catch {
        res.status(500).json({ error: "Could not fetch wallet balance. Check your network connection." });
    }
});
// POST /wallet/verify-payment
router.post("/verify-payment", async (req, res) => {
    const { walletAddress, expectedAmountUsdt, afterTimestamp } = req.body;
    if (!walletAddress || !expectedAmountUsdt || afterTimestamp === undefined) {
        res.status(400).json({ error: "walletAddress, expectedAmountUsdt, and afterTimestamp are required" });
        return;
    }
    try {
        const expectedAmount = parseFloat(expectedAmountUsdt);
        const deadline = Date.now() + POLL_TIMEOUT_MS;
        while (Date.now() < deadline) {
            try {
                const url = `${INDEXER_BASE_URL}/api/v1/polygon/usdt/${walletAddress}/token-transfers?fromTs=${afterTimestamp}&sort=desc&limit=20`;
                const indexerRes = await fetch(url, { headers: indexerHeaders() });
                if (indexerRes.ok) {
                    const data = (await indexerRes.json());
                    for (const transfer of data.transfers) {
                        if (transfer.to.toLowerCase() === walletAddress.toLowerCase() &&
                            parseFloat(transfer.amount) >= expectedAmount) {
                            res.json({ confirmed: true, txHash: transfer.transactionHash });
                            return;
                        }
                    }
                }
            }
            catch {
                // Swallow transient errors and continue polling
            }
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }
        res.json({ confirmed: false });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Payment verification failed" });
    }
});
// GET /wallet/transaction/:txHash
router.get("/transaction/:txHash", async (req, res) => {
    const { txHash } = req.params;
    try {
        const url = `${INDEXER_BASE_URL}/api/v1/polygon/usdt/${txHash}/token-transfers`;
        const indexerRes = await fetch(url, { headers: indexerHeaders() });
        if (!indexerRes.ok) {
            res.status(502).json({ error: `Indexer error: ${indexerRes.status}` });
            return;
        }
        const data = (await indexerRes.json());
        const tx = data.transfers.find((t) => t.transactionHash === txHash);
        if (!tx) {
            res.status(404).json({ error: "Transaction not found" });
            return;
        }
        res.json(tx);
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Transaction fetch failed" });
    }
});
// POST /wallet/decrypt
router.post("/decrypt", (req, res) => {
    const { encryptedSeed } = req.body;
    if (!encryptedSeed) {
        res.status(400).json({ error: "encryptedSeed is required" });
        return;
    }
    try {
        const seedPhrase = decryptSeed(encryptedSeed);
        res.json({ seedPhrase });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Decryption failed" });
    }
});
