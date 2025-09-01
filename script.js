/* Password Strength Visualizer – vanilla JS */
if (tips.length === 0 && score >= 55) {
tips.push('Consider a passphrase (4–5 random words).');
tips.push('Use a password manager to store unique passwords.');
}
renderList(tipsEl, tips.map(t => ({ text: t })));
}


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
return s.replace(/[@]/g,'a').replace(/[!]/g,'i').replace(/[0]/g,'o').replace(/[3]/g,'e').replace(/[\$]/g,'s').replace(/[1]/g,'l');
}


function hasSequential(s) {
// Check for 3+ runs increasing or decreasing, or keyboard rows
if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/.test(s)) return true;
if (/(?:012|123|234|345|456|567|678|789)/.test(s)) return true;
const rev = s.split('').reverse().join('');
if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/.test(rev)) return true;
if (/(?:012|123|234|345|456|567|678|789)/.test(rev)) return true;
// Keyboard rows
for (const row of SEQUENCES) {
if (row.includes(s) || s.includes(row)) return true;
// Sliding window of 3
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
})();
