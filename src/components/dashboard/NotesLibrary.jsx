'use client';

import { useEffect, useMemo } from 'react';
import PdfLibrary from './PdfLibrary';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNoteCategories, setNoteCategories } from '@/store/features/noteCategories/noteCategoriesSlice';

function uniqueCategories(categories) {
  return categories.filter((category, index, list) => list.findIndex((item) => item.value === category.value) === index);
}

export default function NotesLibrary() {
  const dispatch = useAppDispatch();
  const { items: categories, status, error } = useAppSelector((state) => state.noteCategories);
  const unique = useMemo(() => uniqueCategories(categories), [categories]);

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchNoteCategories());
  }, [dispatch, status]);

  return <PdfLibrary category="notes" showUsage={false} categories={unique} categoriesLoading={status === 'idle' || status === 'loading'} categoriesError={error} onRetryCategories={() => void dispatch(fetchNoteCategories())} editableCategories={status === 'succeeded'} onCategoriesChanged={(nextCategories) => dispatch(setNoteCategories(uniqueCategories(nextCategories)))} actionKicker="PDF notes library" collectionKicker="Your documents" collectionTitle="All notes" emptyCopy="Upload your first PDF and place it in a folder." modalKicker="Notes library" modalCopy="Choose a folder, then select the PDF you want to keep." deleteCopy="your Notes library" />;
}
