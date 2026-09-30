"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

import CVHeader from "@/components/CVHeader";
import CVForm from "@/components/CVForm";
import CVResult from "@/components/CVResult";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  targetRole: string;
  jobDescription: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
  projects: string;
  certification: string;
};

const initialForm: FormData = {
  fullName: "",
  email: "",
  phone: "",
  targetRole: "",
  jobDescription: "",
  summary: "",
  skills: "",
  experience: "",
  education: "",
  projects: "",
  certification: "",
};

export default function CVPage() {
  const [form, setForm] = useState<FormData>(initialForm);

  const [cv, setCV] = useState("");
  const [editedCV, setEditedCV] = useState("");

  const [score, setScore] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [missingInformation, setMissingInformation] = useState<string[]>(
    []
  );

  const [quota, setQuota] = useState({
    used: 0,
    remaining: 20,
    limit: 20,
  });

  const [loading, setLoading] = useState(false);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const cvPreviewRef = useRef<HTMLDivElement>(null);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const loadQuota = async () => {
    try {
      const data = await apiFetch("/api/quota/");

      setQuota({
        used: Number(data.used ?? 0),
        remaining: Number(data.remaining ?? 0),
        limit: Number(data.limit ?? 20),
      });
    } catch {
      // Quota failure should not prevent the CV page from loading.
    } finally {
      setQuotaLoading(false);
    }
  };

  useEffect(() => {
    loadQuota();
  }, []);

  const generateCV = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your UK phone number.");
      return;
    }

    if (!form.targetRole.trim()) {
      setError("Please enter the job role you're targeting.");
      return;
    }

    if (!form.summary.trim()) {
      setError("Please enter your professional summary.");
      return;
    }

    if (!form.skills.trim()) {
      setError("Please enter your skills.");
      return;
    }

    if (!form.experience.trim()) {
      setError("Please enter your work experience.");
      return;
    }

    if (!form.education.trim()) {
      setError("Please enter your education.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/api/cv/generate/", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          targetRole: form.targetRole,
          jobDescription: form.jobDescription,
          summary: form.summary,
          skills: form.skills,
          experience: form.experience,
          education: form.education,
          projects: form.projects,
          certification: form.certification,
        }),
      });

      const generatedCV = data.cv || "";

      setCV(generatedCV);
      setEditedCV(generatedCV);

      setScore(
        typeof data.score === "number"
          ? data.score
          : null
      );

      setAnalysis(
        typeof data.analysis === "string"
          ? data.analysis
          : ""
      );

      setStrengths(
        Array.isArray(data.strengths)
          ? data.strengths
          : []
      );

      setImprovements(
        Array.isArray(data.improvements)
          ? data.improvements
          : []
      );

      setMissingKeywords(
        Array.isArray(data.missing_keywords)
          ? data.missing_keywords
          : []
      );

      setMissingInformation(
        Array.isArray(data.missing_information)
          ? data.missing_information
          : []
      );

      setQuota({
        used: Number(data.used ?? 0),
        remaining: Number(data.remaining ?? 0),
        limit: Number(data.limit ?? 20),
      });

      setIsEditing(false);
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong while generating your CV."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm(initialForm);
    setCV("");
    setEditedCV("");
    setScore(null);
    setAnalysis("");
    setStrengths([]);
    setImprovements([]);
    setMissingKeywords([]);
    setMissingInformation([]);
    setError("");
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditedCV(cv);
    setIsEditing(true);
  };

  const saveEditedCV = () => {
    setCV(editedCV);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setEditedCV(cv);
    setIsEditing(false);
  };

  const downloadCV = async () => {
    if (!cvPreviewRef.current || !editedCV.trim()) {
      return;
    }

    setDownloading(true);
    setError("");

    try {
      const html2pdfModule = await import("html2pdf.js");

      const html2pdf = html2pdfModule.default;

      const safeName =
        form.fullName
          .trim()
          .replace(/[^a-z0-9]+/gi, "-")
          .replace(/^-+|-+$/g, "")
          .toLowerCase() || "alphabot-cv";

      const element = cvPreviewRef.current;

      const options = {
        margin: [0.55, 0.65, 0.55, 0.65],

        filename: `${safeName}-cv.pdf`,

        image: {
          type: "jpeg",
          quality: 0.98,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        },

        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait",
        },

        pagebreak: {
          mode: ["css", "legacy"],
        },
      };

      await html2pdf()
        .set(options as any)
        .from(element)
        .save();
    } catch {
      setError(
        "AlphaBot couldn't create the PDF. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] px-4 pb-16 pt-24 text-white sm:px-6 sm:pb-20 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <CVHeader
          quota={quota}
          quotaLoading={quotaLoading}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">

          <CVForm
            form={form}
            updateField={updateField}
            generateCV={generateCV}
            clearForm={clearForm}
            loading={loading}
            quota={quota}
            quotaLoading={quotaLoading}
            error={error}
          />

          <CVResult
            cv={cv}
            editedCV={editedCV}
            score={score}
            analysis={analysis}
            strengths={strengths}
            improvements={improvements}
            missingKeywords={missingKeywords}
            missingInformation={missingInformation}
            targetRole={form.targetRole}
            jobDescription={form.jobDescription}
            isEditing={isEditing}
            downloading={downloading}
            cvPreviewRef={cvPreviewRef}
            onStartEditing={startEditing}
            onDownload={downloadCV}
            onCancelEditing={cancelEditing}
            onSaveEditing={saveEditedCV}
            onEditedCVChange={setEditedCV}
          />

        </div>
      </div>
    </main>
  );
}