import PdfLibrary from './PdfLibrary';

export default function AhdNamaUpload() {
  return <PdfLibrary category="ahd-nama" showUsage={false} emptyCopy="Use the upload button above to add your first Ahd Nama." modalKicker="Ahd Nama archive" modalCopy="Choose a written covenant, note, or reflection to add to your personal archive." deleteCopy="your Ahd Nama archive" />;
}
