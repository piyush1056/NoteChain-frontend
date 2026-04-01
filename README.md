🚀 Solana Note-Taking dApp (Frontend)

CodeClimb Notes is a decentralized, CRUD-based note-taking application built on the Solana Blockchain. It leverages PDAs (Program Derived Addresses) to ensure secure, user-specific data storage with a high-performance Next.js interface.

🌟 Key Technical Features
🔐 Seamless Web3 Auth: Integrated Solana Wallet Adapter for secure connection with Phantom and Solflare, managing real-time session states.

👤 On-Chain User Profiles: Implemented PDA-based profile creation, ensuring each user has a unique, verifiable identity stored directly on the Solana Devnet.

📝 Decentralized CRUD Operations: Engineered full Create, Read, Update, and Delete functionality by interacting with Anchor Program instructions via the @coral-xyz/anchor library.

🛡️ Secure PDA Derivation: Utilized findProgramAddressSync to derive deterministic addresses for notes, ensuring authority-only access and data integrity.

⚡ Optimized Performance: Built with Next.js 14+ and Tailwind CSS for a responsive, low-latency "Dark Theme" UI that mimics traditional SaaS experiences.

🛠️ Tech Stack & Tools
Frontend: Next.js, TypeScript, Tailwind CSS, Lucide React.

Web3: @solana/web3.js, @coral-xyz/anchor, Solana Wallet Adapter.

Network: Solana Devnet.

🏗️ Architecture & Flow

1. Data Modeling (PDAs)
The app interacts with two primary account types on-chain:

User Profile: ["user_profile", wallet_pubkey] — Stores metadata and note counts.

Note Account: ["note", wallet_pubkey, note_id] — Stores the actual title and content.

2. Interaction Layer
Uses a custom useNoteProgram hook to centralize all RPC calls, handling:

IDL Integration: Mapping frontend calls to the smart contract’s ABI.

Transaction Confirmation: Providing real-time UI feedback during the "signature-to-confirmation" lifecycle.

🚀 Quick Start
Install: npm install

Configure: Update PROGRAM_ID and idl.ts with your deployed Anchor details.

Run: npm run dev

Network: Ensure your wallet is set to Solana Devnet.

👨‍💻 Author
 Piyush – Final Year CS Student