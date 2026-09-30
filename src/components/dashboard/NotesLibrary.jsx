'use client';

import { useEffect, useState } from 'react';
import PdfLibrary from './PdfLibrary';

function uniqueCategories(categories) {
  return categories.filter((category, index, list) => list.findIndex((item) => item.value === category.value) === index);
}

export default function NotesLibrary() {
  const [categories, setCategories] = useState([]);
  const [categoriesReady, setCategoriesReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/note-categories', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Categories could not be loaded.')))
      .then((payload) => {
        if (!isMounted) return;
        if (Array.isArray(payload.data)) setCategories(uniqueCategories(payload.data));
        setCategoriesReady(true);
      })
      .catch(() => undefined);

    return () => { isMounted = false; };
  }, []);

  return <PdfLibrary category="notes" showUsage={false} categories={uniqueCategories(categories)} editableCategories={categoriesReady} onCategoriesChanged={(nextCategories) => setCategories(uniqueCategories(nextCategories))} actionKicker="PDF notes library" collectionKicker="Your documents" collectionTitle="All notes" emptyCopy="Upload your first PDF and place it in a category." modalKicker="Notes library" modalCopy="Select a category first, then choose the PDF you want to keep." deleteCopy="your Notes library" />;
}
