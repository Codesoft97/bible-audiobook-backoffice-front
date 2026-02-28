'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { BibleBook, BibleBooksResponse } from '@/types';
import LoadingSpinner from '@/components/loading-spinner';
import Link from 'next/link';

type FilterType = 'all' | 'completed' | 'pending';

export default function BooksPage() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get<BibleBooksResponse>('/api/bible-books');
        setBooks(response.data.data);
      } catch {
        setError('Erro ao carregar os livros. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch = book.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter =
        filter === 'all' ||
        (filter === 'completed' && book.isCompleted) ||
        (filter === 'pending' && !book.isCompleted);
      return matchesSearch && matchesFilter;
    });
  }, [books, search, filter]);

  const stats = useMemo(() => {
    const completed = books.filter((b) => b.isCompleted).length;
    return {
      total: books.length,
      completed,
      pending: books.length - completed,
    };
  }, [books]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted text-sm">Carregando livros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-error/40 bg-error/10 px-8 py-6 text-center">
          <svg className="mx-auto h-10 w-10 text-error mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-error font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-error/20 px-4 py-2 text-sm text-error hover:bg-error/30 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Livros da Bíblia</h1>
        <p className="text-muted text-sm mt-1">
          Gerencie a criação de audiobooks para cada livro
        </p>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Total</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-success/20 bg-success/5 p-4">
          <p className="text-xs font-medium text-success uppercase tracking-wider">Completos</p>
          <p className="mt-1 text-2xl font-bold text-success">{stats.completed}</p>
        </div>
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
          <p className="text-xs font-medium text-warning uppercase tracking-wider">Pendentes</p>
          <p className="mt-1 text-2xl font-bold text-warning">{stats.pending}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            id="search-books"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar livro..."
            className="w-full rounded-xl border border-input-border bg-input-bg py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted/50 transition-colors focus:border-input-focus focus:outline-none"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {([
            { key: 'all', label: 'Todos' },
            { key: 'completed', label: 'Completos' },
            { key: 'pending', label: 'Pendentes' },
          ] as { key: FilterType; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              id={`filter-${key}`}
              onClick={() => setFilter(key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${filter === key
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-card border border-border text-muted hover:text-foreground hover:border-primary/30'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-muted">
        {filteredBooks.length} livro{filteredBooks.length !== 1 ? 's' : ''} encontrado{filteredBooks.length !== 1 ? 's' : ''}
      </p>

      {/* Books grid */}
      {filteredBooks.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card/30 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-muted/50 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-muted">Nenhum livro encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookCard({ book }: { book: BibleBook }) {
  const progress = book.totalChapters > 0
    ? Math.round((book.currentChapter / book.totalChapters) * 100)
    : 0;

  return (
    <Link
      href={`/books/${book.id}`}
      id={`book-${book.abbrev}`}
      className="group relative rounded-2xl border border-border bg-card/50 p-5 transition-all duration-200 hover:border-primary/40 hover:bg-card-hover hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      {/* Completion badge */}
      {book.isCompleted && (
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-success shadow-lg shadow-success/30">
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      )}

      {/* Book info */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary-light transition-colors">
            {book.name}
          </h3>
          <span className="text-xs text-muted uppercase tracking-wider">{book.abbrev}</span>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary-light font-bold text-sm">
          {book.totalChapters}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted">Progresso</span>
          <span className="text-xs font-medium text-foreground">
            {book.currentChapter}/{book.totalChapters} capítulos
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full transition-all duration-500 ${book.isCompleted
                ? 'bg-gradient-to-r from-success to-green-400'
                : 'bg-gradient-to-r from-primary to-primary-light'
              }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${book.isCompleted
              ? 'bg-success/10 text-success'
              : 'bg-primary/10 text-primary-light'
            }`}
        >
          {book.isCompleted ? (
            <>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Completo
            </>
          ) : (
            <>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Em progresso
            </>
          )}
        </span>
        <svg className="h-4 w-4 text-muted group-hover:text-primary-light transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
}
