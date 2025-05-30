// File: app/static/js/encryption.js

// --- IMPORTANT PREFACE ---
// This script uses CryptoJS for cryptographic operations.
// Ensure CryptoJS is loaded before this script.
// Example via CDN in base.html:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"></script>
// --- END IMPORTANT PREFACE ---

const SEED_STORAGE_KEY = 'onionShortenerSeedPhrase';
// IMPORTANT: The user MUST change this PBKDF2_SALT to a unique, random string for their application.
const PBKDF2_SALT = "a_static_application_wide_salt_for_pbkdf2_change_this_in_production"; 
const PBKDF2_ITERATIONS = 10000; // Number of iterations for PBKDF2
const KEY_SIZE_BITS = 256; // AES-256

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

function deriveKeyFromSeed(seedPhrase) {
    if (typeof CryptoJS === 'undefined') {
        console.error("CryptoJS library is not loaded. Cannot derive key.");
        return null;
    }
    if (!seedPhrase) {
        console.error("Seed phrase is empty. Cannot derive key.");
        return null;
    }
    // The salt should be a WordArray for PBKDF2
    const salt = CryptoJS.enc.Utf8.parse(PBKDF2_SALT); 

    const key = CryptoJS.PBKDF2(seedPhrase, salt, {
        keySize: KEY_SIZE_BITS / 32, // keySize is in 32-bit words
        iterations: PBKDF2_ITERATIONS,
        hasher: CryptoJS.algo.SHA256 // Explicitly specify SHA256 as the hasher algorithm
    });
    return key; // This is a WordArray
}

function encryptText(plainText, seedPhrase) {
    if (typeof CryptoJS === 'undefined') {
        console.error("CryptoJS library is not loaded. Cannot encrypt.");
        return null;
    }
    if (!plainText || !seedPhrase) {
        console.error("Plaintext or seed phrase is empty. Cannot encrypt.");
        return null;
    }

    const derivedKey = deriveKeyFromSeed(seedPhrase);
    if (!derivedKey) return null;

    try {
        const encrypted = CryptoJS.AES.encrypt(plainText, derivedKey, {
            mode: CryptoJS.mode.CBC, 
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString(); 
    } catch (e) {
        console.error("Encryption failed:", e);
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

    const derivedKey = deriveKeyFromSeed(seedPhrase);
    if (!derivedKey) return null;

    try {
        const decrypted = CryptoJS.AES.decrypt(cipherTextString, derivedKey, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        const originalText = decrypted.toString(CryptoJS.enc.Utf8);

        if (!originalText && cipherTextString) {
            console.warn("Decryption resulted in an empty string. This might indicate a problem (e.g., incorrect key or corrupted data).");
        }
        return originalText;
    } catch (e) {
        console.error("Decryption failed:", e);
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
    return seed;
}

function displaySeedWarning(seedPhrase, dialogElementId) {
    const dialog = document.getElementById(dialogElementId);
    if (dialog) {
        const seedDisplay = dialog.querySelector('.seed-phrase-display');
        if (seedDisplay) seedDisplay.textContent = seedPhrase;
        dialog.style.display = 'flex'; 
    } else {
        alert(
`Keep this seed phrase secret and safe!
Your personal seed phrase is:

${seedPhrase}

You will need this phrase to access your links if you clear your browser data or use a different browser.
Nobody, not even administrators, can recover your links or your seed without this seed phrase.`
        );
    }
}
