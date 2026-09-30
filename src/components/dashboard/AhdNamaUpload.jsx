import PdfLibrary from './PdfLibrary';
import AhdNamaLockButton from './AhdNamaLockButton';

export default function AhdNamaUpload() {
  return (
    <div className="bk-ahd-vault">
      <div className="bk-ahd-vault-toolbar">
        <div>
          <span className="bk-ahd-vault-kicker">Private archive</span>
          <p>Keep your written commitments close, calm, and protected.</p>
        </div>
        <AhdNamaLockButton />
      </div>
      <PdfLibrary
        category="ahd-nama"
        showUsage={false}
        emptyCopy="Use the upload button above to add your first Ahd Nama."
        modalKicker="Ahd Nama archive"
        modalCopy="Choose a written covenant, note, or reflection to add to your personal archive."
        deleteCopy="your Ahd Nama archive"
      />
    </div>
  );
}
