import CVResultTools from "./CVResultTools";
import CVAnalysis from "./CVAnalysis";
import CVEditor from "./CVEditor";
import CVPreview from "./CVPreview";
import CVEmptyState from "./CVEmptyState";

type CVResultProps = {
  cv: string;
  editedCV: string;
  score: number | null;
  analysis: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  missingInformation: string[];
  targetRole: string;
  jobDescription: string;
  isEditing: boolean;
  downloading: boolean;
  cvPreviewRef: React.RefObject<HTMLDivElement | null>;
  onStartEditing: () => void;
  onDownload: () => void;
  onCancelEditing: () => void;
  onSaveEditing: () => void;
  onEditedCVChange: (value: string) => void;
};

export default function CVResult({
  cv,
  editedCV,
  score,
  analysis,
  strengths,
  improvements,
  missingKeywords,
  missingInformation,
  targetRole,
  jobDescription,
  isEditing,
  downloading,
  cvPreviewRef,
  onStartEditing,
  onDownload,
  onCancelEditing,
  onSaveEditing,
  onEditedCVChange,
}: CVResultProps) {
  return (
    <section className="min-w-0">
      {!editedCV ? (
        <CVEmptyState />
      ) : (
        <>
          <CVResultTools
            targetRole={targetRole}
            isEditing={isEditing}
            downloading={downloading}
            onStartEditing={onStartEditing}
            onDownload={onDownload}
            onCancelEditing={onCancelEditing}
            onSaveEditing={onSaveEditing}
          />

          {!isEditing && (
            <CVAnalysis
              score={score}
              analysis={analysis}
              strengths={strengths}
              improvements={improvements}
              missingKeywords={missingKeywords}
              missingInformation={missingInformation}
              jobDescription={jobDescription}
            />
          )}

          {isEditing ? (
            <CVEditor
              editedCV={editedCV}
              onChange={onEditedCVChange}
            />
          ) : (
            <CVPreview
              editedCV={editedCV}
              cvPreviewRef={cvPreviewRef}
            />
          )}
        </>
      )}
    </section>
  );
}