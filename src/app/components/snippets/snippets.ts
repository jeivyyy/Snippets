import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface SnippetItem {
  id: number;
  name: string;
  text: string;
}

@Component({
  selector: 'app-snippets',
  imports: [FormsModule],
  templateUrl: './snippets.html',
  styleUrl: './snippets.css',
})
export class Snippets {
  snippetText = '';

  snippets: SnippetItem[] = [];

  isNamingWindowOpen = false;
  pendingText = '';
  pendingName = '';
  nameError = '';

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: Event) {
    const keyboardEvent = event as KeyboardEvent;

    const isAltC =
      keyboardEvent.altKey &&
      keyboardEvent.key.toLowerCase() === 'c';

    const isEscape =
      keyboardEvent.key === 'Escape';

    if (this.isNamingWindowOpen && isEscape) {
      keyboardEvent.preventDefault();
      keyboardEvent.stopPropagation();

      this.nameError = 'Dê um nome ao texto antes de fechar.';
      return;
    }

    if (this.isNamingWindowOpen) {
      return;
    }

    if (isAltC) {
      keyboardEvent.preventDefault();

      const capturedText = this.getCapturedText();

      this.openNamingWindow(capturedText);
    }
  }

  openNamingWindow(text: string) {
    if (!text || !text.trim()) {
      return;
    }

    this.pendingText = text;
    this.pendingName = '';
    this.nameError = '';
    this.isNamingWindowOpen = true;
  }

  async savePendingSnippet() {
    const name = this.pendingName.trim();

    if (!name) {
      this.nameError = 'Informe um nome para salvar este texto.';
      return;
    }

    if (!this.pendingText.trim()) {
      return;
    }

    const newSnippet: SnippetItem = {
      id: Date.now(),
      name,
      text: this.pendingText,
    };

    this.snippets.unshift(newSnippet);

    try {
      await navigator.clipboard.writeText(this.pendingText);
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
    }

    this.clearPendingSnippet();
  }

  cancelPendingSnippet() {
    this.nameError = 'Dê um nome ao texto antes de fechar.';
  }

  async copySavedSnippet(text: string) {
    if (!text.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Erro ao copiar texto salvo:', error);
    }
  }

  private clearPendingSnippet() {
    this.pendingText = '';
    this.pendingName = '';
    this.nameError = '';
    this.isNamingWindowOpen = false;
  }

  private getCapturedText(): string {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;

    const isInput =
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement;

    if (isInput) {
      const value = activeElement.value;

      const selectionStart = activeElement.selectionStart ?? 0;
      const selectionEnd = activeElement.selectionEnd ?? 0;

      const selectedText =
        selectionStart !== selectionEnd
          ? value.slice(selectionStart, selectionEnd)
          : '';

      return selectedText || value;
    }

    const selectedPageText = window.getSelection()?.toString() ?? '';

    if (selectedPageText.trim()) {
      return selectedPageText;
    }

    return this.snippetText;
  }
}