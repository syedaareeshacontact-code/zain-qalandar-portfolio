'use client';

import PdfLibrary from './PdfLibrary';

export default function CvLibrary() {
  return (
    <div className="bk-cv-manager">
      <div className="bk-cv-manager-intro">
        <div>
          <p className="bk-ahd-kicker">Public profile file</p>
          <h2>Latest CV</h2>
          <p>Upload a new PDF here whenever your CV changes. The newest upload becomes the CV visitors download from the homepage.</p>
        </div>
        <span className="bk-cv-manager-badge">Homepage synced</span>
      </div>
      <PdfLibrary
        category="cv"
        showUsage={false}
        actionKicker="CV manager"
        collectionKicker="Your CV files"
        collectionTitle="Uploaded CVs"
        emptyCopy="Upload your first CV to connect it to the homepage download button."
        modalKicker="CV manager"
        modalCopy="Choose the latest PDF version of your CV. It will become the public download automatically."
        deleteCopy="your CV manager"
      />
    </div>
  );
}

