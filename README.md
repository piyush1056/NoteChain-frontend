# NoteChain Frontend 🖥️ | Decentralized Note-Taking DApp

Welcome to the frontend repository of **NoteChain**, a fully decentralized, fast, and secure note-taking application built on the Solana blockchain. 

While the NoteChain smart contract handles the core logic and security on-chain, this frontend provides a seamless, modern, and intuitive user interface. Built with **Next.js** and **Tailwind CSS**, it allows users to connect their Solana wallets, manage their on-chain identity, and securely collaborate on notes without relying on a centralized database.

## 🌟 Why NoteChain? (The Problem it Solves)

Traditional note-taking applications (like Notion or Evernote) store your private thoughts on centralized servers. This leaves your data vulnerable to server outages, corporate data mining, or censorship. 

NoteChain shifts the paradigm by giving users **cryptographic ownership** of their data. Your wallet is your identity, your permissions are enforced by smart contracts, and your content is distributed.

## ✨ Deep Dive into Key Features

### 1. Web3 Authentication (No Passwords)
We completely eliminated traditional email/password logins. Authentication is handled seamlessly via the `@solana/wallet-adapter-react`. Users simply connect their Phantom (or compatible) wallet, and the app instantly fetches their on-chain Program Derived Address (PDA) to load their profile.

### 2. Hybrid Storage (Solana + IPFS)
Storing large amounts of text directly on the Solana blockchain can become expensive due to rent costs. To solve this, the frontend utilizes a highly optimized hybrid architecture:
* When a user saves a note, the frontend first uploads the heavy text content to **IPFS (InterPlanetary File System)** via Pinata.
* We receive a lightweight IPFS URL (CID) in return.
* We then send *only* that short URL to the Solana smart contract to be saved on-chain.
* When viewing a note, the `NoteCard` component automatically decrypts and fetches the text from IPFS behind the scenes. The user just sees a fast, smooth UI.

### 3. API Rate Limiting & Bot Protection
Because transaction fees on Devnet are virtually zero, dApps are highly vulnerable to spam bots. To protect the RPC nodes and the smart contract, we implemented **Upstash Redis**. Every note creation or sharing action hits a Next.js API route that limits requests to 5 per minute per IP address, ensuring network stability.

### 4. Real-Time Collaboration Tab
The UI features a dynamic dashboard with a dedicated "Shared With Me" tab. By reading the `SharedAccess` PDAs from the blockchain, the frontend instantly populates a list of notes that friends have granted you edit access to, allowing true cross-wallet collaboration.

## 🛠️ Technology Stack

**Core Framework & UI**
* **Next.js (App Router)**: For server-side rendering and robust API routes.
* **React 19**: Utilizing modern hooks (`useMemo`, `useCallback`) for heavy state management.
* **Tailwind CSS**: For a clean, responsive, dark-themed user interface.
* **Lucide React**: For lightweight, crisp iconography.
* **React Hot Toast**: For beautiful, real-time transaction notifications.

**Web3 & Blockchain**
* **`@solana/web3.js` & `@coral-xyz/anchor`**: The core libraries used to communicate with our custom Rust smart contract.
* **Solana Wallet Adapter**: For handling wallet connections and transaction signing.

**Infrastructure & Storage**
* **Pinata API**: For pinning JSON data to the IPFS network.
* **Upstash Redis & `@upstash/ratelimit`**: For edge-compatible rate limiting.

## 📂 Project Architecture

Here is a quick look at how the codebase is structured:

* `src/app/page.tsx`: The main entry point, disabling SSR for the dashboard to prevent wallet hydration errors.
* `src/components/`: 
  * `Dashboard.tsx`: The main hub managing the tabs for "My Notes" and "Shared Notes".
  * `NoteCard.tsx`: A complex component that handles fetching IPFS content, editing, deleting, and granting shared access.
  * `WalletProvider.tsx`: Wraps the application in the necessary Solana contexts.
* `src/hooks/useNoteProgram.ts`: The absolute powerhouse of the frontend. It abstracts all complex Anchor RPC calls, PDA derivations, and data fetching into clean, reusable React hooks.
* `src/app/api/`:
  * `ipfs/route.ts`: Secure backend route to upload content to Pinata without exposing API keys to the browser.
  * `check-limit/route.ts`: The Redis-powered rate limiter.

## 🚀 Local Setup & Installation

Want to run the frontend locally? Follow these steps:

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn
* A Solana Wallet browser extension (like Phantom) set to **Devnet**.

### 1. Clone the Repository
```bash
git clone <your-frontend-repo-url>
cd notechain-frontend

### 2. Install Dependencies
```bash
npm install

### 3. Environment Setup
Create a .env.local file in the root of your project. You will need to set up free accounts on Pinata and Upstash to get these keys.
```bash
PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_UPSTASH_URL=your_upstash_url
NEXT_PUBLIC_UPSTASH_TOKEN=your_upstash_token
```

### 4. Configure Wallet & RPC
Open `src/config/config.ts` and ensure the `PROGRAM_ID` matches the public key of the smart contract you deployed on the Solana Devnet.

### 5. Run the Application
```bash
npm run dev
```
Open http://localhost:3000 with your browser to see the result. Connect your wallet, create a profile, and start writing decentralized notes!

📜 License
This project is open-source and available under the MIT License.