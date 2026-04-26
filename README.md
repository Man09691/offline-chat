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
#general — casual conversation and announcements
#help    — emergencies only, need help or offering help
#location — share coordinates and meeting points
#random  — off topic conversations

Each room is fully isolated — different users, different messages, different keys.

## Tech Stack

* Node.js
* Express
* Socket.IO
* Web Crypto API (RSA-OAEP)
* HTML / CSS / JavaScript

## How To Run
git clone https://github.com/Man09691/offline-chat
cd offline-chat
npm install
node generate-cert.js
node server.js

Open `https://YOUR-IP:3443` on host device.

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