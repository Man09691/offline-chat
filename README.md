# 📡 Offline Chat

A real-time mesh chat app that works **completely without internet** — just a WiFi hotspot and a browser.

## The Problem

During natural disasters, internet shutdowns, or network failures — all communication apps fail.
WhatsApp, Telegram, iMessage — all dead.
Even existing offline apps like Briar require **pre-installation on both devices**.

## My Solution

One person runs the app → Creates a hotspot → Others connect via browser.
**No app installation needed on the other device. Just a browser.**

## Features

* ✅ Real time messaging over local WiFi hotspot
* ✅ Mesh relay — messages hop device to device
* ✅ Duplicate prevention — same message never shown twice
* ✅ Hop counter — prevents infinite message loops
* ✅ QR Code joining — scan to connect instantly, no IP typing
* ✅ Typing indicator — see when someone is typing
* ✅ Online users count — live count per room
* ✅ Sound notifications — on new message
* ✅ File & Image sharing — with preview before sending
* ✅ File size display — shown in chat bubble
* ✅ End to End Encryption — RSA-OAEP via Web Crypto API
* ✅ Private messaging — encrypted messages to specific users
* ✅ User list — click any user to private message them
* ✅ Read receipts — single tick, grey double tick, blue double tick
* ✅ Emoji reactions — tap any message to react
* ✅ Message search — search by text or username
* ✅ Chat rooms — General, Help, Location, Random
* ✅ Room isolation — messages, users and keys stay within room
* ✅ PWA installable — add to home screen, works offline
* ✅ Mobile friendly — works on any phone browser
* ✅ Zero internet required

## How It Works

### Mesh Relay
Phone A → Phone B → Phone C → Phone D

Every device running the app acts as both a user and a relay node.
Messages hop across devices until they reach everyone.

### End To End Encryption
Sender encrypts with receiver's public key
→ Travels as gibberish through server and relays
→ Only receiver can decrypt with their private key

Even the server cannot read your messages.

### QR Code Joining
Host runs server → QR code auto-generated
→ Other device scans QR → Chat opens instantly

### Chat Rooms
- `#general` — casual conversation and announcements
- `#help` — emergencies only, need help or offering help
- `#location` — share coordinates and meeting points
- `#random` — off topic conversations

Each room is fully isolated — different users, different messages, different keys.

## Tech Stack

* Node.js
* Express
* Socket.IO
* Web Crypto API (RSA-OAEP)
* HTML / CSS / JavaScript

## How To Run

```bash
git clone https://github.com/Man09691/offline-chat
cd offline-chat
npm install
node generate-cert.js
node server.js
```

Open `https://YOUR-IP:3443` on the host device.

Connect another device to the same WiFi/hotspot and either:

* Scan the QR code shown on join screen
* Open `https://YOUR-IP:3443` in browser
* Accept the self-signed certificate warning once

## Note on Encryption

End to End Encryption uses the **Web Crypto API** which only works on:

* `localhost` — always works ✅
* `HTTPS` — always works ✅
* Plain `HTTP` IP — not supported by browser ⚠️

App automatically falls back to unencrypted mode with a warning shown in header.

## Security Notes

* `cert.pem` and `key.pem` are generated locally by `generate-cert.js` and are **never committed to GitHub** (excluded via `.gitignore`). Each user generates their own certificate pair when they run the app.
* These files live at the **project root**, not inside `public/` — anything inside `public/` is served directly to browsers over HTTP, so certs must stay outside it or the private key becomes downloadable by anyone on the network.
* The certificate is self-signed, so browsers will show a one-time security warning on first connect. This is expected — accept it via "Advanced → Proceed" to continue.

## Known Limitations / Troubleshooting

**"The page just keeps loading, no certificate warning appears"**
This almost always means the two devices aren't actually reachable on the same network yet — the connection never reaches the server, so the browser has nothing to warn about. Common causes:

* **Stale static IP on the host laptop.** Windows sometimes keeps a manually-set static IP from a previous network (e.g. college/office WiFi) instead of picking up a fresh address from the phone's hotspot via DHCP. Check via `ipconfig` → if `DHCP Enabled` shows `No`, switch the adapter back to *"Obtain an IP address automatically"* in the adapter's IPv4 properties, then reconnect to the hotspot.
* **Firewall blocking inbound connections.** The host's OS firewall can silently drop incoming connections on port `3443` from other devices, even though `localhost` works fine locally. Allow Node.js through the firewall for both Private and Public networks.
* **Wrong protocol.** The server only runs on HTTPS — typing `http://` instead of `https://` will hang indefinitely.

**"The IP address keeps changing every time I reconnect"**
The host device's IP is assigned by the hotspot's DHCP server and isn't guaranteed to stay the same across sessions. Two ways to work around this:
1. Set a **static IP** on the host device matching the hotspot's subnet (works reliably as long as you're reconnecting to the *same* hotspot each time).
2. Always rely on the **QR code** rather than a memorized/typed IP — the QR is regenerated fresh from the current IP every time the server starts, so it's always accurate.

**"No way to discover the host without already knowing the IP"**
This is a real, unsolved limitation for true zero-knowledge disaster scenarios (i.e. a stranger joining a hotspot with no prior instructions). Possible future solutions:
* Hosting the server directly on the phone (e.g. via Termux) so the address is the hotspot's own gateway IP, which is more predictable than a DHCP-assigned client IP.
* A captcaptive-portal style redirect (like hotel WiFi), so any URL typed automatically redirects to the chat app — technically the most robust fix, but requires a local DNS layer and is out of scope for the current version.
* Physical/printed QR codes as a low-tech backup for when a phone screen isn't visible.

## Roadmap

* Phase 1 ✅ LAN chat over hotspot
* Phase 2 ✅ Mesh relay — messages hop device to device
* Phase 3 ✅ E2E Encryption — RSA based
* Phase 4 ✅ Private messaging — encrypted targeted messages
* Phase 5 ✅ HTTPS support — self signed cert, valid 10 years
* Phase 6 ✅ Chat rooms — isolated channels for different purposes
* Phase 7 ✅ PWA — installable on phone home screen
* Phase 8 🔮 Voice notes — record and send audio messages
* Phase 9 🔮 Android app — one tap hotspot server
* Phase 10 🔮 Captive portal / zero-knowledge discovery for true disaster-scenario onboarding
