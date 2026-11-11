import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  durationMs?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(type: 'success' | 'error' | 'warning' | 'info', message: string, durationMs = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, message, durationMs };
    
    this.toastsSignal.update(toasts => [...toasts, toast]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.remove(id);
      }, durationMs);
    }
  }

  success(message: string, durationMs = 4000) {
    this.show('success', message, durationMs);
  }

  error(message: string, durationMs = 5000) {
    this.show('error', message, durationMs);
  }

  warning(message: string, durationMs = 4500) {
    this.show('warning', message, durationMs);
  }

  info(message: string, durationMs = 4000) {
    this.show('info', message, durationMs);
  }

  remove(id: string) {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }
}

