'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_NOTE_CATEGORIES } from '@/data/noteCategories';
import PdfLibrary from './PdfLibrary';

const FALLBACK_CATEGORIES = DEFAULT_NOTE_CATEGORIES.map((category) => ({
  id: category.slug,
  value: category.slug,
  label: category.label,
  description: category.description,
  icon: category.icon,
  isDefault: category.isDefault,
}));

export default function NotesLibrary() {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [categoriesReady, setCategoriesReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/note-categories', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Categories could not be loaded.')))
      .then((payload) => {
        if (!isMounted) return;
        if (Array.isArray(payload.data) && payload.data.length) setCategories(payload.data);
        setCategoriesReady(true);
      })
      .catch(() => undefined);

    return () => { isMounted = false; };
  }, []);

  return <PdfLibrary category="notes" categories={categories} editableCategories={categoriesReady} onCategoriesChanged={setCategories} actionKicker="PDF notes library" collectionKicker="Your documents" collectionTitle="All notes" emptyCopy="Upload your first PDF and place it in a category." modalKicker="Notes library" modalCopy="Select a category first, then choose the PDF you want to keep." deleteCopy="your Notes library" />;
}
