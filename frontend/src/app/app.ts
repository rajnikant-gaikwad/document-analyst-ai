import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpClient, HttpClientModule, HttpEventType } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

/**
 * Root Angular component for the Document Q&A AI frontend.
 * Handles: file upload, question input, backend communication, and displaying answers.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  // =============================
  // 💡 SIGNAL-BASED STATE VARIABLES
  // =============================

  /** The user's question typed in the input box */
  query = signal('');

  /** The AI-generated answer to display on UI */
  response = signal('');

  /** Loading indicator (true while uploading or processing) */
  loading = signal(false);

  /** Name of the uploaded document */
  fileName = signal('');

  /** Progress percentage while uploading a file */
  uploadProgress = signal<number | null>(null);

  // =============================
  // 🔧 DEPENDENCIES & REFERENCES
  // =============================

  /** Reference to file input element for triggering open dialog programmatically */
  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>;

  /** Angular HttpClient for API communication */
  private http = inject(HttpClient);
  
  // Backend base URL (adjust if running elsewhere)
  backendUrl = 'http://localhost:8000';

  /** Document token injected for DOM access if ever needed */
  private document = inject(DOCUMENT);

  // =============================
  // 📁 FILE HANDLING LOGIC
  // =============================

  /** Opens file chooser when “Choose File” button clicked */
  triggerFileSelect() {
    this.fileInputRef.nativeElement.click();
  }

  /**
   * Handles file selection and initiates upload to backend.
   * Backend endpoint: POST /api/upload
   */
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Save filename to show on UI
    this.fileName.set(file.name);

    // Prepare form data for multipart upload
    const formData = new FormData();
    formData.append('file', file);

    // Start loader & progress indicator
    this.loading.set(true);
    this.uploadProgress.set(0);

    // Make POST request to backend with progress tracking
    this.http.post<{ message: string }>(`${this.backendUrl}/upload`,
      formData,
      { reportProgress: true, observe: 'events' }
    ).subscribe({
      next: (event) => {
        // Track upload progress
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const percent = Math.round((100 * event.loaded) / event.total);
          this.uploadProgress.set(percent);
        }
        // Handle final response after successful upload
        else if (event.type === HttpEventType.Response) {
          this.loading.set(false);
          this.uploadProgress.set(null);
          console.log('✅ File uploaded successfully:', event.body?.message);
        }
      },
      error: (err) => {
        console.error('❌ File upload failed:', err);
        this.loading.set(false);
        this.uploadProgress.set(null);
      }
    });
  }

  // =============================
  // ❓ QUESTION-ANSWER LOGIC
  // =============================

  /**
   * Sends a question to backend for retrieval-augmented generation.
   * Backend endpoint: POST /api/ask
   */
  askQuestion() {
    // Don’t proceed if question empty
    if (!this.query()) return;

    // Reset previous response and show loader
    this.loading.set(true);
    this.response.set('');

    // Send POST request with user question
    this.http.post<{ answer: string }>(`${this.backendUrl}/ask`, { question: this.query() })
      .subscribe({
        next: (res) => {
          // Show AI answer on UI
          this.response.set(res.answer);
          this.loading.set(false);
        },
        error: (err) => {
          // Handle error gracefully
          console.error('❌ Error fetching answer:', err);
          this.response.set('⚠️ Something went wrong while processing your question.');
          this.loading.set(false);
        }
      });
  }
}
