# 🔒 Password Strength Visualizer

A lightweight, client-side web app that evaluates password strength **in real time** and explains *why* a password is weak or strong. It estimates entropy, shows a color-coded meter, and provides a crack-time estimate with clear, actionable tips.

[![Live Demo](https://img.shields.io/badge/Live-Demo-1e90ff)](#) 
[![Made with HTML](https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white)](#)
[![CSS](https://img.shields.io/badge/CSS-3-1572B6?logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=000)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Privacy:** 100% client-side. No passwords leave your browser.

---

## ✨ Features

- **Live strength meter** (Weak / Okay / Strong / Excellent)
- **Entropy estimate** (bits) based on character set and length
- **Crack-time estimate** with selectable **attack model**:
  - Offline (10¹⁰ guesses/sec)  
  - Online (100 guesses/sec)
- **Real-world checks**:
  - Dictionary/l33t words (e.g., `password`, months, common words)
  - Keyboard/sequence patterns (e.g., `qwerty`, `abc123`)
  - Repetition runs (e.g., `aaaa`)
  - Year suffixes (e.g., `2025!`)
- **Actionable tips** to improve strength
- **Polished UI** with subtle gradients and professional dark theme

---

## 📸 Demo

> Add a quick GIF or screenshot here to boost engagement.

![Demo](docs/demo.gif)

---

## 🚀 Try It

Open `index.html` directly, or run a tiny local server:

```bash
# Option A: VS Code → “Open with Live Server”
# Option B: Python
python -m http.server 8000
# then visit http://localhost:8000
