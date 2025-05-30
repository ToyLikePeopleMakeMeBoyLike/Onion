// File: app/static/js/encryption.js

// --- IMPORTANT PREFACE ---
// This script uses CryptoJS for cryptographic operations.
// Ensure CryptoJS is loaded before this script.
// Example via CDN in base.html:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"></script>
// --- END IMPORTANT PREFACE ---

const SEED_STORAGE_KEY = 'onionShortenerSeedPhrase';

// A simple list of 4-character words for seed phrase generation.
// For a real application, use a more comprehensive and vetted wordlist (e.g., BIP39).
const FOUR_CHAR_WORD_LIST = ["able", "acid", "also", "area", "army", "away", "baby", "back", "ball", "band", "bank", "base", "bath", "bear", "beat", "been", "beer", "bell", "belt", "best", "bill", "bird", "blow", "blue", "boat", "body", "bomb", "bond", "bone", "book", "boot", "born", "boss", "both", "bowl", "box", "boy", "cake", "call", "calm", "came", "camp", "card", "care", "case", "cash", "cast", "cat", "cell", "chat", "chef", "city", "clay", "club", "coal", "coat", "code", "coin", "cold", "come", "cook", "cool", "copy", "core", "corn", "cost", "crew", "crop", "dark", "data", "date", "deal", "dear", "debt", "deep", "desk", "dial", "dice", "dirt", "disk", "dock", "door", "dose", "down", "draw", "dream", "dress", "drink", "drive", "drop", "drug", "drum", "duck", "dust", "duty", "each", "earn", "east", "easy", "edge", "edit", "else", "even", "evil", "exit", "face", "fact", "fade", "fail", "fair", "fall", "farm", "fast", "fate", "fear", "feed", "feel", "feet", "fell", "felt", "file", "fill", "film", "find", "fine", "fire", "firm", "fish", "fist", "five", "fix", "flag", "flat", "flow", "food", "foot", "fork", "form", "fort", "four", "free", "fuel", "full", "fund", "game", "gang", "gate", "gave", "gear", "gift", "girl", "give", "glad", "glass", "gold", "golf", "good", "grab", "gray", "grew", "grey", "grid", "grip", "grow", "guts", "hair", "half", "hall", "hand", "hang", "hard", "harm", "hate", "have", "head", "heal", "hear", "heat", "held", "hell", "help", "here", "hero", "hide", "high", "hike", "hill", "hint", "hire", "hold", "hole", "holy", "home", "hope", "horn", "host", "hour", "huge", "hunt", "hurt", "idea", "idle", "inch", "info", "iron", "item", "jail", "jazz", "join", "joke", "jump", "jury", "just", "keep", "kept", "key", "kick", "kill", "kind", "king", "kiss", "knee", "knew", "know", "lack", "lady", "lake", "lamb", "lamp", "land", "lane", "last", "late", "lawn", "lead", "leaf", "lean", "left", "lend", "less", "life", "lift", "like", "line", "link", "list", "live", "load", "loan", "lock", "logo", "long", "look", "loop", "lord", "lose", "loss", "lost", "loud", "love", "luck", "mail", "main", "make", "male", "many", "maps", "mark", "mass", "meal", "mean", "meat", "meet", "menu", "mild", "milk", "mind", "mine", "miss", "mood", "moon", "more", "most", "move", "much", "must", "name", "navy", "near", "neat", "neck", "need", "news", "next", "nice", "night", "nine", "none", "noon", "norm", "nose", "note", "odds", "once", "only", "onto", "open", "oral", "pack", "page", "pain", "pair", "pale", "park", "part", "pass", "past", "path", "peak", "pick", "pile", "pill", "pink", "pipe", "plan", "play", "plot", "plug", "poem", "poet", "pole", "pond", "pony", "pool", "poor", "pope", "pork", "port", "post", "pour", "pray", "prev", "prey", "pull", "pump", "pure", "push", "quiz", "race", "rack", "rage", "rail", "rain", "rank", "rare", "rate", "read", "real", "rely", "rent", "rest", "rich", "ride", "ring", "rise", "risk", "road", "rock", "role", "roll", "roof", "room", "root", "rope", "rose", "ruby", "rude", "ruin", "rule", "rush", "rust", "safe", "sail", "sake", "salt", "same", "sand", "save", "scar", "seal", "seat", "seed", "seek", "sell", "send", "sense", "sent", "serf", "sets", "sick", "side", "sigh", "sign", "silk", "sing", "sink", "size", "skill", "skin", "slap", "slip", "slow", "snap", "snow", "soap", "soft", "soil", "sold", "sole", "solo", "some", "song", "soon", "sort", "soul", "soup", "spin", "spot", "star", "stay", "step", "stop", "such", "suit", "sure", "swim", "tail", "take", "tale", "talk", "tall", "tank", "tape", "task", "taxi", "team", "tear", "tech", "tell", "tend", "tent", "term", "test", "text", "than", "that", "them", "then", "they", "thin", "this", "thus", "tide", "tidy", "tier", "tile", "time", "tiny", "tips", "tire", "told", "toll", "tone", "tool", "torn", "tour", "town", "trap", "tree", "trim", "trip", "true", "try", "tube", "tuna", "tune", "turn", "twin", "type", "ugly", "unit", "upon", "used", "user", "vast", "very", "veto", "vice", "view", "void", "vote", "wage", "wait", "wake", "walk", "wall", "want", "ward", "warm", "warn", "wash", "wave", "ways", "weak", "wear", "week", "well", "went", "were", "west", "what", "when", "whip", "wide", "wife", "wild", "will", "wind", "wine", "wing", "wipe", "wire", "wise", "wish", "with", "wolf", "wood", "wool", "word", "wore", "work", "worm", "wrap", "yard", "year", "yell", "your", "zero", "zone"];


function generateUserSeedPhrase(numWords = 6) {
    let phrase = [];
    for (let i = 0; i < numWords; i++) {
        phrase.push(FOUR_CHAR_WORD_LIST[Math.floor(Math.random() * FOUR_CHAR_WORD_LIST.length)]);
    }
    return phrase.join(' ');
}

function encryptText(plainText, seedPhrase) {
    console.log('encryptText: Called with plainText (first 10 chars):', plainText ? plainText.substring(0, 10) + '...' : 'null/undefined', 'and seedPhrase (first 10 chars):', seedPhrase ? seedPhrase.substring(0, 10) + '...' : 'null/undefined');
    if (typeof CryptoJS === 'undefined') {
        console.error("CryptoJS library is not loaded. Cannot encrypt.");
        return null;
    }
    if (!plainText || !seedPhrase) {
        console.error("Plaintext or seed phrase is empty. Cannot encrypt.");
        return null;
    }

    try {
        const plainTextWordArray = CryptoJS.enc.Utf8.parse(plainText);
        // Use seedPhrase directly as the passphrase
        const encrypted = CryptoJS.AES.encrypt(plainTextWordArray, seedPhrase); 
        
        console.log('encryptText: Encryption successful (using seed as passphrase). Ciphertext (first 10 chars):', encrypted ? encrypted.toString().substring(0, 10) + '...' : 'null/undefined');
        return encrypted.toString(); 
    } catch (e) {
        console.error("Encryption failed IN CATCH BLOCK (using seed as passphrase):", e, e.stack);
        return null;
    }
}

function decryptText(cipherTextString, seedPhrase) {
    if (typeof CryptoJS === 'undefined') {
        console.error("CryptoJS library is not loaded. Cannot decrypt.");
        return null;
    }
    if (!cipherTextString || !seedPhrase) {
        console.error("Ciphertext or seed phrase is empty. Cannot decrypt.");
        return null;
    }

    try {
        // Use seedPhrase directly as the passphrase
        const decrypted = CryptoJS.AES.decrypt(cipherTextString, seedPhrase);
        const originalText = decrypted.toString(CryptoJS.enc.Utf8);

        if (!originalText && cipherTextString) {
            console.warn("Decryption resulted in an empty string (using seed as passphrase). This might indicate a problem.");
        }
        console.log('decryptText: Decryption attempt finished (using seed as passphrase). Resulting text (first 10 chars):', originalText ? originalText.substring(0, 10) + '...' : '(empty or null)');
        return originalText;
    } catch (e) {
        console.error("Decryption failed IN CATCH BLOCK (using seed as passphrase):", e, e.stack);
        return null;
    }
}

function getStoredSeed() {
    return localStorage.getItem(SEED_STORAGE_KEY);
}

function storeSeed(seedPhrase) {
    localStorage.setItem(SEED_STORAGE_KEY, seedPhrase);
}

function ensureSeedIsAvailable() {
    let seed = getStoredSeed();
    if (!seed) {
        seed = generateUserSeedPhrase();
        storeSeed(seed);
    }
    // If a new seed was generated, open the management dialog to show it with a warning.
    if (isNewSeed) {
        openSeedManagementDialog(seed); // Pass the newly generated seed
    }
    return seed;
}

function openSeedManagementDialog(isFirstTimeGeneratedSeed = null) {
    const dialog = document.getElementById('seedManagementDialog');
    if (!dialog) {
        console.error("Seed management dialog not found in DOM.");
        // Fallback alert if dialog is missing, for newly generated seed
        if (isFirstTimeGeneratedSeed) {
            alert(
`IMPORTANT: Your new recovery seed phrase is:

${isFirstTimeGeneratedSeed}

Please copy this and store it in a secret and safe place.
You will need this phrase to access your links if you clear your browser data or use a different browser.`
            );
        }
        return;
    }

    const titleEl = document.getElementById('seedDialogTitle');
    const currentDisplayEl = document.getElementById('currentSeedPhraseDisplay');
    const manualInputEl = document.getElementById('manualSeedInput');
    const warningSectionEl = document.getElementById('seedWarningSection');
    const displaySectionEl = document.getElementById('seedDisplaySection'); // Assuming this is the parent of currentSeedPhraseDisplay
    const statusEl = document.getElementById('seedActionStatus');

    const seedToDisplay = isFirstTimeGeneratedSeed || getStoredSeed();

    if (seedToDisplay) {
        if (currentDisplayEl) currentDisplayEl.textContent = seedToDisplay;
        if (manualInputEl) manualInputEl.value = seedToDisplay; // Pre-fill for editing
        if (displaySectionEl) displaySectionEl.style.display = 'block';
    } else {
        if (currentDisplayEl) currentDisplayEl.textContent = '(No seed currently stored)';
        if (manualInputEl) manualInputEl.value = '';
        // Decide if displaySectionEl should be hidden or shown with "no seed" message
        if (displaySectionEl) displaySectionEl.style.display = 'block'; 
    }

    if (isFirstTimeGeneratedSeed) {
        if (titleEl) titleEl.textContent = 'IMPORTANT: Your Recovery Seed Phrase!';
        if (warningSectionEl) warningSectionEl.style.display = 'block';
    } else {
        if (titleEl) titleEl.textContent = 'Manage Your Seed Phrase';
        if (warningSectionEl) warningSectionEl.style.display = 'none';
    }

    if (statusEl) statusEl.textContent = ''; // Clear previous status
    dialog.style.display = 'flex';
}

function saveSeedFromInput() {
    const manualInputEl = document.getElementById('manualSeedInput');
    const currentDisplayEl = document.getElementById('currentSeedPhraseDisplay');
    const statusEl = document.getElementById('seedActionStatus');
    const warningSectionEl = document.getElementById('seedWarningSection');
    const titleEl = document.getElementById('seedDialogTitle');

    if (!manualInputEl || !currentDisplayEl || !statusEl || !warningSectionEl || !titleEl) {
        console.error("One or more dialog elements not found for saveSeedFromInput.");
        return;
    }

    const newSeed = manualInputEl.value.trim();

    // Basic validation: check if not empty and maybe word count (e.g., at least 2 words)
    if (!newSeed || newSeed.split(' ').length < 2) {
        statusEl.textContent = 'Error: Seed phrase must not be empty and should contain multiple words.';
        statusEl.className = 'text-sm text-red-400 mt-3'; // Error color
        return;
    }
    // Could add more validation here (e.g. check against FOUR_CHAR_WORD_LIST if desired, or length)

    storeSeed(newSeed);
    currentDisplayEl.textContent = newSeed;
    statusEl.textContent = 'Seed saved to browser localStorage!';
    statusEl.className = 'text-sm text-green-400 mt-3'; // Success color

    // Hide the "new seed" warning if it was visible, and reset title
    warningSectionEl.style.display = 'none';
    titleEl.textContent = 'Manage Your Seed Phrase';
    
    document.dispatchEvent(new Event('seedUpdated')); // Notify other parts of the app
}

function clearStoredSeedFromDialog() {
    const currentDisplayEl = document.getElementById('currentSeedPhraseDisplay');
    const manualInputEl = document.getElementById('manualSeedInput');
    const statusEl = document.getElementById('seedActionStatus');
     const warningSectionEl = document.getElementById('seedWarningSection');
    const titleEl = document.getElementById('seedDialogTitle');


    if (!currentDisplayEl || !manualInputEl || !statusEl || !warningSectionEl || !titleEl) {
        console.error("One or more dialog elements not found for clearStoredSeedFromDialog.");
        return;
    }

    localStorage.removeItem(SEED_STORAGE_KEY);
    currentDisplayEl.textContent = '(No seed currently stored)';
    manualInputEl.value = '';
    statusEl.textContent = 'Stored seed cleared from browser localStorage!';
    statusEl.className = 'text-sm text-green-400 mt-3';

    // Hide the "new seed" warning if it was visible, and reset title
    warningSectionEl.style.display = 'none';
    titleEl.textContent = 'Manage Your Seed Phrase';

    document.dispatchEvent(new Event('seedUpdated')); // Notify other parts of the app
}
