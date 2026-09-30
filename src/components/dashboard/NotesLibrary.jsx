'use client';

import { useEffect } from 'react';
import PdfLibrary from './PdfLibrary';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNoteCategories, setNoteCategories } from '@/store/features/noteCategories/noteCategoriesSlice';

function uniqueCategories(categories) {
  return categories.filter((category, index, list) => list.findIndex((item) => item.value === category.value) === index);
}

export default function NotesLibrary() {
  const dispatch = useAppDispatch();
  const { items: categories, status } = useAppSelector((state) => state.noteCategories);

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchNoteCategories());
  }, [dispatch, status]);

  return <PdfLibrary category="notes" showUsage={false} categories={uniqueCategories(categories)} categoriesLoading={status === 'idle' || status === 'loading'} editableCategories={status === 'succeeded'} onCategoriesChanged={(nextCategories) => dispatch(setNoteCategories(uniqueCategories(nextCategories)))} actionKicker="PDF notes library" collectionKicker="Your documents" collectionTitle="All notes" emptyCopy="Upload your first PDF and place it in a category." modalKicker="Notes library" modalCopy="Select a category first, then choose the PDF you want to keep." deleteCopy="your Notes library" />;
}
