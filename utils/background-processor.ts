import { transcribeAudio, generateSummary } from "@/utils/api";
import { Note } from "@/types/note";
import performanceMonitor from "@/utils/performance-monitor";

class BackgroundProcessor {
  private processingQueue: Map<string, Promise<void>> = new Map();
  private maxConcurrentProcessing = 2;
  private currentProcessing = 0;
  
  async processNote(
    note: Note, 
    updateNoteFn: (note: Note) => Promise<Note>,
    language?: string
  ): Promise<void> {
    // Prevent duplicate processing
    if (this.processingQueue.has(note.id)) {
      console.log(`Note ${note.id} is already being processed`);
      return this.processingQueue.get(note.id)!;
    }
    
    // Check if we've hit the concurrent processing limit
    if (this.currentProcessing >= this.maxConcurrentProcessing) {
      console.log(`Processing queue full, waiting for slot...`);
      await this.waitForProcessingSlot();
    }
    
    const processingPromise = this.executeProcessing(note, updateNoteFn, language);
    this.processingQueue.set(note.id, processingPromise);
    
    try {
      await processingPromise;
    } finally {
      this.processingQueue.delete(note.id);
    }
  }
  
  private async waitForProcessingSlot(): Promise<void> {
    return new Promise((resolve) => {
      const checkSlot = () => {
        if (this.currentProcessing < this.maxConcurrentProcessing) {
          resolve();
        } else {
          setTimeout(checkSlot, 1000);
        }
      };
      checkSlot();
    });
  }
  
  private async executeProcessing(
    note: Note, 
    updateNoteFn: (note: Note) => Promise<Note>,
    language?: string
  ): Promise<void> {
    this.currentProcessing++;
    
    try {
      console.log(`Starting background processing for note: ${note.id}`);
      performanceMonitor.startTimer(`processing-${note.id}`);
      
      if (!note.recordingUri) {
        throw new Error("No recording URI found");
      }
      
      // Step 1: Transcribe the audio with automatic translation
      console.log(`Transcribing audio for note: ${note.id}`);
      performanceMonitor.startTimer(`transcription-${note.id}`);
      const transcriptionResult = await transcribeAudio(
        note.recordingUri, 
        language, 
        true // Enable automatic translation to English
      );
      performanceMonitor.endTimer(`transcription-${note.id}`);
      
      // Update note with transcript, translation, and language info
      const noteWithTranscript = {
        ...note,
        transcript: transcriptionResult.text, // This will be English if translated
        detectedLanguage: transcriptionResult.detectedLanguage,
        confidence: transcriptionResult.confidence,
        language: language || transcriptionResult.detectedLanguage || 'en',
        originalText: transcriptionResult.originalText,
        translatedText: transcriptionResult.translatedText,
        isTranslated: transcriptionResult.isTranslated,
      };
      await updateNoteFn(noteWithTranscript);
      console.log(`Transcription completed for note: ${note.id}`);
      
      // Step 2: Generate summary
      console.log(`Generating summary for note: ${note.id}`);
      performanceMonitor.startTimer(`summary-${note.id}`);
      const summary = await generateSummary(
        transcriptionResult.text, 
        noteWithTranscript.language
      );
      performanceMonitor.endTimer(`summary-${note.id}`);
      
      // Final update with summary and mark as completed
      const completedNote = {
        ...noteWithTranscript,
        summary,
        isProcessing: false,
      };
      
      await updateNoteFn(completedNote);
      performanceMonitor.endTimer(`processing-${note.id}`);
      console.log(`Processing completed for note: ${note.id}`);
      
      // Log performance metrics every 5 processed notes
      if (this.processingQueue.size % 5 === 0) {
        performanceMonitor.logMetrics();
      }
      
    } catch (error) {
      console.error(`Failed to process note ${note.id}:`, error);
      
      // Update note with error state
      const errorNote = {
        ...note,
        isProcessing: false,
        processingError: error instanceof Error ? error.message : "Processing failed",
      };
      
      try {
        await updateNoteFn(errorNote);
      } catch (updateError) {
        console.error(`Failed to update note with error state:`, updateError);
      }
    } finally {
      this.currentProcessing--;
    }
  }
  
  // Get current processing status
  getProcessingStatus(): { 
    queueSize: number; 
    currentProcessing: number; 
    maxConcurrent: number;
  } {
    return {
      queueSize: this.processingQueue.size,
      currentProcessing: this.currentProcessing,
      maxConcurrent: this.maxConcurrentProcessing,
    };
  }
  
  // Check if a note is currently being processed
  isProcessing(noteId: string): boolean {
    return this.processingQueue.has(noteId);
  }
  
  // Cancel processing for a specific note
  cancelProcessing(noteId: string): void {
    if (this.processingQueue.has(noteId)) {
      console.log(`Cancelling processing for note: ${noteId}`);
      this.processingQueue.delete(noteId);
    }
  }
}

export default new BackgroundProcessor();