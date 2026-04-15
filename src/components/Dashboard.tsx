"use client";

import { FC, useEffect, useState, useCallback, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Toaster } from "react-hot-toast";
import { useNoteProgram } from "@/hooks/useNoteProgram";
import { UserProfile, NoteWithPubkey } from "@/types/note";
import { CreateUser } from "./CreateUser";
import { CreateNote } from "./CreateNote";
import { NoteList } from "./NoteList";
import { BN } from "@coral-xyz/anchor";
import { NETWORK } from "@/utils/constants";
import { NotebookPen } from 'lucide-react';


import "@solana/wallet-adapter-react-ui/styles.css";

const DashboardContent: FC = () => {
  const { connected, publicKey } = useWallet();
  
  const { getUserProfile, getUserNotes, fetchSharedNotes } = useNoteProgram();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<NoteWithPubkey[]>([]);
  const [sharedNotes, setSharedNotes] = useState<NoteWithPubkey[]>([]); 
  const [activeTab, setActiveTab] = useState<'mine' | 'shared'>('mine'); 
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!connected || !publicKey) {
      setUserProfile(null);
      setNotes([]);
      setSharedNotes([]);
      return;
    }

    setCheckingProfile(true);

    try {
      const profile = await getUserProfile();
      setUserProfile(profile);

      if (profile) {
        setLoading(true);
        // Fetch both user notes and shared notes in parallel
        const [userNotes, sNotes] = await Promise.all([
          getUserNotes(),
          fetchSharedNotes()
        ]);
        setNotes(userNotes);
        setSharedNotes(sNotes);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setCheckingProfile(false);
      setLoading(false);
    }
  }, [connected, publicKey, getUserProfile, getUserNotes, fetchSharedNotes]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleUserCreated = () => fetchUserData();
  const handleNoteCreated = () => fetchUserData();
  const handleRefresh = () => fetchUserData();

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">
            <NotebookPen className="inline-block mr-2" />
            Solana Note-Chain
          </h1>
          <WalletMultiButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!connected ? (
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold mb-4">Welcome to Solana Notes</h2>
            <p className="text-gray-400 mb-8">
              Connect your wallet to start creating notes on the Solana blockchain.
            </p>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
          </div>
        ) : checkingProfile ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Checking your profile...</p>
          </div>
        ) : !userProfile ? (
          <CreateUser onUserCreated={handleUserCreated} />
        ) : (
          <div>
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Welcome, {userProfile.username}!
                  </h2>
                  <p className="text-sm text-gray-400">
                    Wallet: {publicKey?.toString().slice(0, 8)}...
                    {publicKey?.toString().slice(-8)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Total Notes</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {userProfile.noteCount instanceof BN
                      ? userProfile.noteCount.toNumber()
                      : Number(userProfile.noteCount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <CreateNote onNoteCreated={handleNoteCreated} />
            </div>

            {/* Tabs for My Notes and Shared Notes */}
            <div className="flex gap-6 mb-6 border-b border-gray-700">
              <button
                onClick={() => setActiveTab('mine')}
                className={`pb-2 px-1 text-lg font-medium transition-colors ${
                  activeTab === 'mine'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                My Notes
              </button>
              <button
                onClick={() => setActiveTab('shared')}
                className={`pb-2 px-1 text-lg font-medium transition-colors ${
                  activeTab === 'shared'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Shared With Me ({sharedNotes.length})
              </button>
            </div>

            {/* Render based on active tab */}
            {activeTab === 'mine' ? (
              <NoteList notes={notes} onRefresh={handleRefresh} loading={loading} />
            ) : (
              <NoteList notes={sharedNotes} onRefresh={handleRefresh} loading={loading} isSharedView={true} />
            )}
            
          </div>
        )}
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          <p>
            Built on Solana Devnet | Program ID:{" "}
            <code className="text-purple-400">CmGDsQ...X5Aji</code>
          </p>
        </div>
      </footer>
    </div>
  );
};

export const Dashboard: FC = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={NETWORK}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <DashboardContent />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1f2937",
                color: "#fff",
                border: "1px solid #374151",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};