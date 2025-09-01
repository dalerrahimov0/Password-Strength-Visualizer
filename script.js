/* Password Strength Visualizer – vanilla JS */
(function () {
  // ---- Rate handling (Attack model toggle) ----
  // We read guesses/sec from the <select id="attack"> in index.html.
  function getRate() {
    const sel = document.getElementById('attack');
    const val = sel ? Number(sel.value) : 1e10; // default to offline 10^10
    return isFinite(val) && val > 0 ? val : 1e10;
  }

  const DICT = [
    'password','letmein','welcome','admin','dragon','monkey','iloveyou','qwerty','asdf','zxcv','baseball','football','login','abc123',
    'summer','winter','spring','autumn','fall','january','february','march','april','may','june','july','august','september','october','november','december'
  ];
  const SEQUENCES = ['abcdefghijklmnopqrstuvwxyz','qwertyuiop','asdfghjkl','zxcvbnm','0123456789'];

  // ---- DOM refs ----
  const el = (id) => document.getElementById(id);
  const pwd = el('pwd');
  const toggle = el('toggle');
  const meterBar = el('meter-bar');
  const meterLabel = el('meter-label');
  const entropyEl = el('entropy');
  const crackEl = el('crack');
  const checksEl = el('checks');
  const tipsEl = el('tips');
  const attack = el('attack'); // new dropdown
  const rateSpan = el('rate'); // span in the "Assuming ..." line

  // ---- UI events ----
  if (toggle) {
    toggle.addEventListener('click', () => {
      pwd.type = pwd.type === 'password' ? 'text' : 'password';
      toggle.textContent = pwd.type === 'password' ? 'Show' : 'Hide';
    });
  }

  if (pwd) pwd.addEventListener('input', () => analyze(pwd.value));
  if (attack) attack.addEventListener('change', () => analyze(pwd.value));

  // initial render
  analyze('');

  // ---- Core analysis ----
  function analyze(pw) {
    const findings = [];
    const tips = [];

    // Character set detection
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasDigit = /\d/.test(pw);
    const hasSymbol = /[^A-Za-z0-9]/.test(pw);

    let pool = 0;
    if (hasLower) pool += 26;
    if (hasUpper) pool += 26;
    if (hasDigit) pool += 10;
    if (hasSymbol) pool += 33; // approx printable symbols

    const length = pw.length;
    const rawEntropy = length > 0 && pool > 0 ? length * Math.log2(pool) : 0;

    // Heuristic penalties
    let penalty = 0;

    // 1) Dictionary words & l33t variants
    const simple = normalizeLeet(pw).toLowerCase();
    const foundWord = DICT.find(w => simple.includes(w));
    if (foundWord) {
      findings.push([`Contains common word: "${foundWord}"`, 'fail']);
      penalty += 15;
      tips.push('Avoid common words, names, or months.');
    }

    // 2) Repetitions
    if (/(.)\1{2,}/.test(pw)) {
      findings.push(['Contains repeated characters (e.g., aaa)', 'warn']);
      penalty += 10;
      tips.push('Avoid long runs of the same character.');
    }

    // 3) Sequential patterns (abc, 123, qwerty)
    if (hasSequential(simple)) {
      findings.push(['Contains sequential/keyboard pattern', 'fail']);
      penalty += 15;
      tips.push('Break up obvious sequences like abc, 123, qwerty.');
    }

    // 4) Year suffixes
    if (/20\d{2}(?:[!@#$%^&*()]*)$/.test(pw)) {
      findings.push(['Ends with a year (e.g., 2025!)', 'warn']);
      penalty += 8;
      tips.push('Avoid predictable suffixes like a year + symbol.');
    }

    // 5) Length checks
    if (length < 8) {
      findings.push(['Short length (< 8)', 'fail']);
      tips.push('Use at least 12–16 characters.');
      penalty += 20;
    } else if (length < 12) {
      findings.push(['Medium length (8–11)', 'warn']);
      tips.push('Longer is stronger—aim for 12–16+.');
      penalty += 5;
    } else {
      findings.push(['Good length (12+)', 'success']);
    }

    // 6) Diversity checks
    const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
    if (classes <= 1) {
      findings.push(['Low character variety', 'fail']);
      tips.push('Mix upper/lowercase, digits, and symbols.');
      penalty += 15;
    } else if (classes === 2) {
      findings.push(['Okay character variety', 'warn']);
      penalty += 5;
    } else {
      findings.push(['Good character variety', 'success']);
    }

    // Final score (0–100)
    let score = Math.max(0, Math.min(100, Math.round(rawEntropy - penalty)));

    // Map score -> label & color
    let label = 'Weak';
    let color = getCSS('--weak');
    if (score >= 75) { label = 'Excellent'; color = getCSS('--excellent'); }
    else if (score >= 55) { label = 'Strong'; color = getCSS('--strong'); }
    else if (score >= 35) { label = 'Okay'; color = getCSS('--ok'); }

    meterBar.style.width = `${Math.max(4, score)}%`;
    meterBar.style.background = color;
    meterLabel.textContent = `${label} (${score}/100)`;

    // Entropy & crack time display
    const entropyBits = Math.max(0, rawEntropy - penalty);
    entropyEl.textContent = `${entropyBits.toFixed(1)} bits`;

    const crackSeconds = Math.pow(2, Math.max(0, entropyBits)) / getRate();
    crackEl.textContent = humanizeDuration(crackSeconds);

    // Update displayed rate text
    if (rateSpan) rateSpan.textContent = formatRate(getRate());

    // Render findings & tips
    renderList(checksEl, findings.map(([t, cls]) => ({ text: t, cls })));

    if (tips.length === 0 && score >= 55) {
      tips.push('Consider a passphrase (4–5 random words).');
      tips.push('Use a password manager to store unique passwords.');
    }
    renderList(tipsEl, tips.map(t => ({ text: t })));
  }

  // ---- Helpers ----
  function renderList(ul, items) {
    ul.innerHTML = '';
    for (const item of items) {
      const li = document.createElement('li');
      li.textContent = item.text;
      if (item.cls) li.classList.add(item.cls);
      ul.appendChild(li);
    }
  }

  function normalizeLeet(s) {
    return s
      .replace(/[@]/g,'a')
      .replace(/[!]/g,'i')
      .replace(/[0]/g,'o')
      .replace(/[3]/g,'e')
      .replace(/[\$]/g,'s')
      .replace(/[1]/g,'l');
  }

  function hasSequential(s) {
    // Check for 3+ runs increasing or decreasing, or keyboard rows
    if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/.test(s)) return true;
    if (/(?:012|123|234|345|456|567|678|789)/.test(s)) return true;
    const rev = s.split('').reverse().join('');
    if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/.test(rev)) return true;
    if (/(?:012|123|234|345|456|567|678|789)/.test(rev)) return true;
    for (const row of SEQUENCES) {
      for (let i = 0; i < row.length - 2; i++) {
        const tri = row.slice(i, i + 3);
        if (s.includes(tri)) return true;
      }
    }
    return false;
  }

  function humanizeDuration(seconds) {
    if (!isFinite(seconds) || seconds <= 1) return '< 1s';
    const units = [
      ['year', 31557600],
      ['day', 86400],
      ['hour', 3600],
      ['minute', 60],
      ['second', 1]
    ];
    const parts = [];
    for (const [name, s] of units) {
      const qty = Math.floor(seconds / s);
      if (qty > 0) {
        parts.push(`${qty} ${name}${qty>1?'s':''}`);
        seconds -= qty * s;
      }
      if (parts.length === 2) break; // keep it short
    }
    return parts.join(', ');
  }

  function getCSS(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }

  function formatRate(n) {
    // If n is an exact power of 10, show 10^x. Otherwise show x,xxx guesses/sec.
    const log10 = Math.log10(n);
    if (Number.isInteger(log10)) return `10^${log10} guesses/sec`;
    return `${n.toLocaleString()} guesses/sec`;
  }
})();
