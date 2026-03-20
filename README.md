# 📡 Offline Chat

A real-time chat app that works **without internet** — just a WiFi hotspot.

## The Problem
During natural disasters or internet shutdowns, all communication apps fail.
WhatsApp, Telegram, iMessage — all dead.

## My Solution
Any device creates a hotspot → runs a local server → others connect via browser.
No app installation needed on the other device. Just a browser.

## Features
- ✅ Real time messaging over local WiFi
- ✅ Typing indicator
- ✅ Online users count
- ✅ Sound notifications
- ✅ Works on any device with a browser
- ✅ Zero internet required

## Tech Stack
- Node.js
- Express
- Socket.IO
- HTML/CSS/JS

## How To Run
git clone https://github.com/YOURUSERNAME/offline-chat
cd offline-chat
npm install
node server.js

Then open http://localhost:3000 in browser.
Connect another device to same WiFi and open http://YOUR-IP:3000

## Roadmap
- Phase 1 ✅ LAN chat over hotspot
- Phase 2 ⏳ Mesh relay — messages hop device to device
- Phase 3 🔮 Apple Find My style — nearby phones carry your message