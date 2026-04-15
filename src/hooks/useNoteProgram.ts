"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN, setProvider } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useMemo, useCallback } from "react";
import { IDL } from "@/utils/idl";
import {
  PROGRAM_ID,
  USER_PROFILE_SEED,
  NOTE_SEED,
  SHARE_SEED,
} from "@/utils/constants";
import { UserProfile, Note, NoteWithPubkey } from "@/types/note";

export const useNoteProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

const checkRateLimit = async () => {
    const res = await fetch("/api/check-limit", { method: "POST" });
    if (!res.ok) {
      throw new Error("Rate limit exceeded! Please wait a minute before creating/sharing more notes.");
    }
  };

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;

    const anchorProvider = new AnchorProvider(
      connection,
      wallet as any,
      AnchorProvider.defaultOptions()
    );
    setProvider(anchorProvider);

    return anchorProvider;
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;

    try {
      // For Anchor 0.30+, we need to pass the IDL with the address
      const idlWithAddress = {
        ...IDL,
        address: PROGRAM_ID.toString(),
      };
      return new Program(idlWithAddress as any, provider);
    } catch (error) {
      console.error("Error creating program:", error);
      return null;
    }
  }, [provider]);

  // Derive User Profile PDA
  const getUserProfilePDA = useCallback(
    (userPubkey: PublicKey) => {
      return PublicKey.findProgramAddressSync(
        [Buffer.from(USER_PROFILE_SEED), userPubkey.toBuffer()],
        PROGRAM_ID
      );
    },
    []
  );

  // Derive Note PDA
  const getNotePDA = useCallback(
    (userPubkey: PublicKey, noteId: number) => {
      const noteIdBuffer = new BN(noteId).toArrayLike(Buffer, "le", 8);

      return PublicKey.findProgramAddressSync(
        [Buffer.from(NOTE_SEED), userPubkey.toBuffer(), noteIdBuffer],
        PROGRAM_ID
      );
    },
    []
  );

  const createUser = useCallback(
    async (username: string) => {
      if (!program || !wallet.publicKey) {
        throw new Error("Wallet not connected");
      }
       await checkRateLimit(); // Check rate limit before creating user
      const [userProfilePDA] = getUserProfilePDA(wallet.publicKey);

      const tx = await program.methods
        .createUser(username)
        .accounts({
          userProfile: userProfilePDA,
          signer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    },
    [program, wallet.publicKey, getUserProfilePDA]
  );

  const getUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!program || !wallet.publicKey) return null;

    try {
      const [userProfilePDA] = getUserProfilePDA(wallet.publicKey);
      const profile = await program.account.userProfile.fetch(userProfilePDA);
      return profile as UserProfile;
    } catch (error) {
      console.log("User profile not found");
      return null;
    }
  }, [program, wallet.publicKey, getUserProfilePDA]);

  const createNote = useCallback(
    async (title: string, content: string) => {
      if (!program || !wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      const [userProfilePDA] = getUserProfilePDA(wallet.publicKey);
      const userProfile = await program.account.userProfile.fetch(userProfilePDA);
      const nextNoteId = (userProfile.noteCount as BN).toNumber() + 1;
      await checkRateLimit(); // Check rate limit before creating note

      const [notePDA] = getNotePDA(wallet.publicKey, nextNoteId);

      const tx = await program.methods
        .createNote(title, content)
        .accounts({
          userProfile: userProfilePDA,
          note: notePDA,
          signer: wallet.publicKey,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    },
    [program, wallet.publicKey, getUserProfilePDA, getNotePDA]
  );

  const getUserNotes = useCallback(async (): Promise<NoteWithPubkey[]> => {
    if (!program || !wallet.publicKey) return [];

    try {
      const [userProfilePDA] = getUserProfilePDA(wallet.publicKey);
      const userProfile = await program.account.userProfile.fetch(userProfilePDA);
      const noteCount = (userProfile.noteCount as BN).toNumber();

      const notes: NoteWithPubkey[] = [];

      for (let i = 1; i <= noteCount; i++) {
        try {
          const [notePDA] = getNotePDA(wallet.publicKey, i);
          const note = await program.account.note.fetch(notePDA);
          notes.push({
            ...(note as Note),
            publicKey: notePDA,
          });
        } catch (error) {
          // Note might have been deleted, skip it
          console.log(`Note ${i} not found (possibly deleted)`);
        }
      }

      return notes;
    } catch (error) {
      console.log("Error fetching notes:", error);
      return [];
    }
  }, [program, wallet.publicKey, getUserProfilePDA, getNotePDA]);

  const updateNote = useCallback(
    async (noteId: number, newContent: string) => {
      if (!program || !wallet.publicKey) {
        throw new Error("Wallet not connected");
      }
        await checkRateLimit();
      const [notePDA] = getNotePDA(wallet.publicKey, noteId);

      const tx = await program.methods
        .updateNote(new BN(noteId), newContent)
        .accounts({
          note: notePDA,
          signer: wallet.publicKey,
          authority: wallet.publicKey,
        })
        .rpc();

      return tx;
    },
    [program, wallet.publicKey, getNotePDA]
  );
  const shareNote = useCallback(
    async (noteId: number, friendPublicKeyStr: string) => {
      if (!program || !wallet.publicKey) throw new Error("Wallet not connected");

      const friendPubKey = new PublicKey(friendPublicKeyStr);
      await checkRateLimit(); 
      // exising Note PDA
      const [notePDA] = getNotePDA(wallet.publicKey, noteId); 

      // derive shared access PDA
      const [sharedAccessPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(SHARE_SEED), notePDA.toBuffer(), friendPubKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .shareNote(friendPubKey)
        .accounts({
          signer: wallet.publicKey,
          note: notePDA,
          sharedAccess: sharedAccessPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    },
    [program, wallet.publicKey, getNotePDA]
  );
  const updateSharedNote = useCallback(
    async (notePdaStr: string, newContent: string) => {
      if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
      
      await checkRateLimit();
      const notePDA = new PublicKey(notePdaStr);

      // Derive shared access PDA for the current user and the note
      const [sharedAccessPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(SHARE_SEED), notePDA.toBuffer(), wallet.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .updateSharedNote(newContent)
        .accounts({
          signer: wallet.publicKey, 
          note: notePDA,
          sharedAccess: sharedAccessPDA,
        })
        .rpc();

      return tx;
    },
    [program, wallet.publicKey]
  );
  const fetchSharedNotes = useCallback(async () => {
    if (!program || !wallet.publicKey) return [];

    try {
      // 1. find all shared access accounts where friend is the current user
      const sharedAccounts = await program.account.sharedAccess.all([
        {
          memcmp: {
            offset: 8, 
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);

      // 2. for each shared access, fetch the corresponding note data
      const notes = await Promise.all(
        sharedAccounts.map(async (acc) => {
          const noteData = await program.account.note.fetch(acc.account.notePda);
          return {
            ...noteData,
            publicKey: acc.account.notePda,
          };
        })
      );

      return notes;
    } catch (error) {
      console.error("Error fetching shared notes:", error);
      return [];
    }
  }, [program, wallet.publicKey]);
  const deleteNote = useCallback(
    async (noteId: number) => {
      if (!program || !wallet.publicKey) {
        throw new Error("Wallet not connected");
      }
      await checkRateLimit();
      const [notePDA] = getNotePDA(wallet.publicKey, noteId);

      const tx = await program.methods
        .deleteNote(new BN(noteId))
        .accounts({
          note: notePDA,
          signer: wallet.publicKey,
          authority: wallet.publicKey,
        })
        .rpc();

      return tx;
    },
    [program, wallet.publicKey, getNotePDA]
  );

  return {
    program,
    createUser,
    getUserProfile,
    createNote,
    getUserNotes,
    updateNote,
    deleteNote,
    shareNote,
    updateSharedNote,
    fetchSharedNotes, 
    connected: wallet.connected,
    publicKey: wallet.publicKey,
  };
};
