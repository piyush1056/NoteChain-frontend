"use client";

import { FC } from "react";
import { NoteWithPubkey } from "@/types/note";
import { NoteCard } from "./NoteCard";

interface Props {
  notes: NoteWithPubkey[];
  onRefresh: () => void;
  loading: boolean;
  isSharedView?: boolean; // New prop to identify if it's a shared notes view
}

export const NoteList: FC<Props> = ({ notes, onRefresh, loading ,isSharedView=false}) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-400 mt-2">Loading notes...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-800 rounded-lg">
        {/* Empty state message */}
        <p className="text-gray-400">
          {isSharedView 
            ? "No notes shared with you yet." 
            : "No notes yet. Create your first note!"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{isSharedView ? "Shared Notes" : "Your Notes"} ({notes.length})</h2>
        <button
          onClick={onRefresh}
          className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((note) => (
          <NoteCard
            key={note.publicKey.toString()}
            note={note}
            onNoteUpdated={onRefresh}
            onNoteDeleted={onRefresh}
            isSharedView={isSharedView} // Pass the prop to identify if it's a shared note
          />
        ))}
      </div>
    </div>
  );
};
