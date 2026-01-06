// Import ESM builds from CDN (works on GitHub Pages)
import * as bip39 from "https://cdn.jsdelivr.net/npm/bip39@3.0.4/+esm";
import * as bip32 from "https://cdn.jsdelivr.net/npm/bip32@4.0.0/+esm";
import * as ecc from "https://cdn.jsdelivr.net/npm/tiny-secp256k1@2.2.1/+esm";
import * as bitcoin from "https://cdn.jsdelivr.net/npm/bitcoinjs-lib@6.1.5/+esm";

bitcoin.initEccLib(ecc);

const generateBtn = document.getElementById("generateBtn");
const mnemonicEl = document.getElementById("mnemonic");
const pathEl = document.getElementById("path");
const addressEl = document.getElementById("address");
const balanceEl = document.getElementById("balance");
const statusEl = document.getElementById("status");
const bcTokenEl = document.getElementById("bcToken");

const NETWORK = bitcoin.networks.bitcoin; // mainnet
const DERIVATION_PATH = "m/44'/0'/0'/0/0";

function formatBTCFromSats(sats) {
  const btc = Number(sats) / 1e8;
  return `${btc.toFixed(8)} BTC`;
}

async function deriveAddressFromMnemonic(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("Invalid mnemonic generated.");
  }
  const seed = bip39.mnemonicToSeedSync(mnemonic); // Buffer
  const root = bip32.fromSeed(seed, NETWORK);
  const child = root.derivePath(DERIVATION_PATH);
  const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey, network: NETWORK });
  return { address, child };
}

async function fetchBlockCypherBalance(address, token) {
  const base = `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`;
  const url = token ? `${base}?token=${encodeURIComponent(token)}` : base;

  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`BlockCypher error: ${resp.status} ${resp.statusText}${text ? ` - ${text}` : ""}`);
  }
  return resp.json();
}

async function generateAndCheck() {
  try {
    statusEl.textContent = "Generating mnemonic and address…";
    balanceEl.textContent = "";
    addressEl.textContent = "";
    mnemonicEl.textContent = "";

    // 128 bits of entropy -> 12-word mnemonic
    const mnemonic = bip39.generateMnemonic(128);
    mnemonicEl.textContent = mnemonic;
    pathEl.textContent = DERIVATION_PATH;

    const { address } = await deriveAddressFromMnemonic(mnemonic);
    addressEl.textContent = address;

    statusEl.textContent = "Querying BlockCypher for balance…";
    const token = bcTokenEl.value.trim() || "";
    const data = await fetchBlockCypherBalance(address, token);

    const finalBalance = data.final_balance ?? data.balance ?? 0;
    const unconfirmed = data.unconfirmed_balance ?? 0;
    const total = finalBalance + unconfirmed;

    balanceEl.textContent =
      `Confirmed: ${formatBTCFromSats(finalBalance)}\n` +
      `Unconfirmed: ${formatBTCFromSats(unconfirmed)}\n` +
      `Total: ${formatBTCFromSats(total)}`;

    statusEl.textContent = "Done.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = err.message || "Unexpected error.";
  }
}

generateBtn.addEventListener("click", () => {
  // Small delay for UX feedback
  statusEl.textContent = "";
  generateAndCheck();
});
