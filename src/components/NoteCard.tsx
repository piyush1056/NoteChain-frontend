"use client";

import { FC, useState,useEffect } from "react";
import { NoteWithPubkey } from "@/types/note";
import { useNoteProgram } from "@/hooks/useNoteProgram";
import { MAX_CONTENT_LENGTH } from "@/utils/constants";
import toast from "react-hot-toast";
import { BN } from "@coral-xyz/anchor";

interface Props {
  note: NoteWithPubkey;
  onNoteUpdated: () => void;
  onNoteDeleted?: () => void;
  isSharedView?: boolean; // New prop to identify if it's a shared note view
}

export const NoteCard: FC<Props> = ({ 
  note, 
  onNoteUpdated, 
  onNoteDeleted,
  isSharedView = false 
}) => {
  const [displayContent, setDisplayContent] = useState(note.content);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState(false); // State to toggle share input
  const [friendPublicKey, setFriendPublicKey] = useState(""); // State for collaborator's public key input
  const [editContent, setEditContent] = useState(note.content);
  const [loading, setLoading] = useState(false);
  
  const { updateNote, deleteNote, shareNote, updateSharedNote } = useNoteProgram();

  const noteId = note.id instanceof BN ? note.id.toNumber() : Number(note.id);

  // decode IPFS content if the content is an IPFS URL
  useEffect(() => {
    const fetchIPFSContent = async () => {
      // Check if content looks like an IPFS URL
      if (note.content && note.content.includes("gateway.pinata.cloud/ipfs/")) {
        setIsLoadingContent(true);
        try {
          const res = await fetch(note.content);
          const data = await res.json();
          
          if (data.noteData) {
            setDisplayContent(data.noteData);
          } else if (data.pinataContent?.noteData) {
            setDisplayContent(data.pinataContent.noteData);
          } else {
  
            setDisplayContent("Invalid IPFS data format");
          }
        } catch (error) {
          console.error("IPFS Fetch Error:", error);
          setDisplayContent(" Failed to load content from IPFS");
        } finally {
          setIsLoadingContent(false);
        }
      } else {
        // if it's not an IPFS URL, just display the content as is
        setDisplayContent(note.content);
      }
    };

    fetchIPFSContent();
  }, [note.content]);

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    setLoading(true);
    try {
      let tx;
      if (isSharedView) {
        // If it's a shared note, we need to call the updateSharedNote function
        tx = await updateSharedNote(note.publicKey.toString(), editContent);
      } else {
       // For regular notes, call the updateNote function
        tx = await updateNote(noteId, editContent);
      }
      toast.success(`Note updated! TX: ${tx.slice(0, 8)}...`);
      setIsEditing(false);
      onNoteUpdated();
    } catch (error: any) {
      console.error("Error updating note:", error);
      toast.error(error.message || "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setLoading(true);
    try {
      const tx = await deleteNote(noteId);
      toast.success(`Note deleted! TX: ${tx.slice(0, 8)}...`);
      if (onNoteDeleted) onNoteDeleted();
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast.error(error.message || "Failed to delete note");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!friendPublicKey.trim() || friendPublicKey.length < 32) {
      toast.error("Enter a valid Solana Public Key");
      return;
    }

    setLoading(true);
    try {
      const tx = await shareNote(noteId, friendPublicKey);
      toast.success(`Note Shared! TX: ${tx.slice(0, 8)}...`);
      setIsSharing(false);
      setFriendPublicKey("");
    } catch (error: any) {
      console.error("Error sharing note:", error);
      toast.error(error.message || "Failed to share note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-purple-400">
          {note.title} {isSharedView && <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded ml-2">Shared</span>}
        </h3>
        <span className="text-xs text-gray-500">#{noteId}</span>
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={MAX_CONTENT_LENGTH}
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-2"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mb-2">
            {editContent.length}/{MAX_CONTENT_LENGTH} characters
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={loading || !editContent.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded transition-colors"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(note.content);
              }}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-3 py-1 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-gray-300 mb-4">
            {isLoadingContent ? (
              <div className="flex items-center gap-2 text-purple-400 text-sm animate-pulse">
                <span>🔄 Decrypting from IPFS...</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">{displayContent}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded transition-colors"
            >
              Edit
            </button>
            
            {/* Owner specific buttons (Share and Delete) */}
            {!isSharedView && (
              <>
                <button
                  onClick={() => setIsSharing(!isSharing)}
                  disabled={loading}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded transition-colors"
                >
                  Share
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded transition-colors"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>

          {/* Share Input Field */}
          {isSharing && !isSharedView && (
            <div className="mt-4 p-3 bg-gray-900 rounded-md border border-gray-700">
              <label className="text-xs text-gray-400 block mb-1">Collaborator's Public Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={friendPublicKey}
                  onChange={(e) => setFriendPublicKey(e.target.value)}
                  placeholder="Enter Solana Address..."
                  className="flex-1 px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
                <button
                  onClick={handleShare}
                  disabled={loading || !friendPublicKey}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded"
                >
                  Grant Access
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        PDA: {note.publicKey.toString().slice(0, 20)}...
      </div>
    </div>
  );
};