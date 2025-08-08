import { useEffect } from "react";
import { useNotes } from "@/hooks/use-notes-store";
import backgroundProcessor from "@/utils/background-processor";

export function useBackgroundProcessing() {
  const { processingNotes, updateNote } = useNotes();

  useEffect(() => {
    // Resume processing for any notes that were interrupted
    processingNotes.forEach((note) => {
      if (note.recordingUri && !note.transcript && !backgroundProcessor.isProcessing(note.id)) {
        console.log(`Resuming processing for interrupted note: ${note.id}`);
        backgroundProcessor.processNote(note, updateNote);
      }
    });
  }, [processingNotes, updateNote]);

  return {
    processingStatus: backgroundProcessor.getProcessingStatus(),
  };
}