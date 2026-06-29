import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

type SnippetTag = 'tecnico' | 'importante' | 'urgente' | 'pra-depois';

interface TagOption {
  key: SnippetTag;
  label: string;
  color: string;
  icon: string;
}

interface SnippetItem {
  id: number;
  name: string;
  text: string;
  tag: SnippetTag;
  color: string;
  icon: string;
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
  isFilterOpen = false;

  pendingText = '';
  pendingName = '';
  pendingTag: SnippetTag = 'tecnico';
  nameError = '';

  selectedFilter: SnippetTag | null = null;

  readonly filterIcon = '/src/app/assets/filter_icon.png';

  readonly tagOptions: TagOption[] = [
    {
      key: 'tecnico',
      label: 'Técnico',
      color: '#a4e787',
      icon: '/src/app/assets/wrench_icon.png',
    },
    {
      key: 'importante',
      label: 'Importante',
      color: '#f1f37e',
      icon: '/src/app/assets/star_icon.png',
    },
    {
      key: 'urgente',
      label: 'Urgente',
      color: '#ff6a6a',
      icon: '/src/app/assets/urgent_icon.png',
    },
    {
      key: 'pra-depois',
      label: 'Pra depois',
      color: '#748dff',
      icon: '/src/app/assets/clock_icon.png',
    },
  ];

  get filteredSnippets(): SnippetItem[] {
    if (!this.selectedFilter) {
      return this.snippets;
    }

    const selectedTag = this.getTagOption(this.selectedFilter);

    if (!selectedTag) {
      return this.snippets;
    }

    return this.snippets.filter((snippet) => {
      return (
        snippet.tag === selectedTag.key &&
        snippet.color === selectedTag.color
      );
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: Event) {
    const keyboardEvent = event as KeyboardEvent;

    const isAltC =
      keyboardEvent.altKey &&
      keyboardEvent.key.toLowerCase() === 'c';

    const isEscape = keyboardEvent.key === 'Escape';

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
    this.pendingTag = 'tecnico';
    this.nameError = '';
    this.isNamingWindowOpen = true;
  }

  selectTag(tag: SnippetTag) {
    this.pendingTag = tag;
  }

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  applyFilter(tag: SnippetTag) {
    this.selectedFilter = tag;
    this.isFilterOpen = false;
  }

  clearFilter() {
    this.selectedFilter = null;
    this.isFilterOpen = false;
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

    const selectedTag = this.getTagOption(this.pendingTag);

    if (!selectedTag) {
      this.nameError = 'Selecione uma tag válida.';
      return;
    }

    const newSnippet: SnippetItem = {
      id: Date.now(),
      name,
      text: this.pendingText,
      tag: selectedTag.key,
      color: selectedTag.color,
      icon: selectedTag.icon,
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
    this.pendingTag = 'tecnico';
    this.nameError = '';
    this.isNamingWindowOpen = false;
  }

  private getTagOption(tag: SnippetTag): TagOption | undefined {
    return this.tagOptions.find((option) => option.key === tag);
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