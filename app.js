// Import only bip39 for now
import * as bip39 from "https://cdn.jsdelivr.net/npm/bip39@3.0.4/+esm";

// Grab DOM elements
const generateBtn = document.getElementById("generateBtn");
const mnemonicEl = document.getElementById("mnemonic");
const statusEl = document.getElementById("status");

// Function to generate a random 12-word mnemonic
function generateMnemonic() {
  try {
    statusEl.textContent = "Generating mnemonic…";

    // 128 bits of entropy → 12 words
    const mnemonic = bip39.generateMnemonic(128);

    mnemonicEl.textContent = mnemonic;
    statusEl.textContent = "Done.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error generating mnemonic.";
  }
}

// Attach event listener to button
generateBtn.addEventListener("click", generateMnemonic);
