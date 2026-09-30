"use client";

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

type CVFormProps = {
  form: FormData;
  updateField: (field: keyof FormData, value: string) => void;
  generateCV: (event: React.FormEvent<HTMLFormElement>) => void;
  clearForm: () => void;
  loading: boolean;
  quota: {
    used: number;
    remaining: number;
    limit: number;
  };
  quotaLoading: boolean;
  error: string;
};

export default function CVForm({
  form,
  updateField,
  generateCV,
  clearForm,
  loading,
  quota,
  quotaLoading,
  error,
}: CVFormProps) {
  return (
    <form
      onSubmit={generateCV}
      className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 shadow-2xl shadow-black/20 sm:p-7"
    >
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white">
          Tell AlphaBot about you
        </h2>

        <p className="mt-1 text-sm leading-6 text-zinc-500">
          The more useful context you provide, the more
          accurately AlphaBot can tailor your CV.
        </p>
      </div>

      <div className="space-y-5">
        <Input
          label="Full name"
          value={form.fullName}
          onChange={(value) => updateField("fullName", value)}
          placeholder="John Smith"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => updateField("email", value)}
            placeholder="john@example.com"
          />

          <Input
            label="UK phone"
            value={form.phone}
            onChange={(value) => updateField("phone", value)}
            placeholder="07123 456789"
          />
        </div>

        <div className="rounded-2xl border border-purple-400/15 bg-purple-500/[0.04] p-4">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Target role
              </h3>

              <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-purple-300">
                Required
              </span>
            </div>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Tell AlphaBot what kind of role this CV is
              being created for.
            </p>
          </div>

          <Input
            label=""
            value={form.targetRole}
            onChange={(value) => updateField("targetRole", value)}
            placeholder="Software Engineer"
          />
        </div>

        <Textarea
          label="Job description"
          optional
          value={form.jobDescription}
          onChange={(value) => updateField("jobDescription", value)}
          placeholder="Paste the job description here. AlphaBot will compare your CV against it and identify relevant keywords, strengths and gaps."
          rows={7}
        />

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
          <p className="text-xs leading-5 text-zinc-600">
            No job description? That's fine. AlphaBot can
            still analyse your CV against the target role.
          </p>
        </div>

        <Textarea
          label="Professional summary"
          value={form.summary}
          onChange={(value) => updateField("summary", value)}
          placeholder="Tell AlphaBot about your background, strengths and professional direction..."
          rows={5}
        />

        <Textarea
          label="Skills"
          value={form.skills}
          onChange={(value) => updateField("skills", value)}
          placeholder="Python, Django, JavaScript, Next.js, SQL, Git..."
          rows={4}
        />

        <Textarea
          label="Work experience"
          value={form.experience}
          onChange={(value) => updateField("experience", value)}
          placeholder="Company, role, dates, responsibilities, achievements and anything you want AlphaBot to know..."
          rows={8}
        />

        <Textarea
          label="Education"
          value={form.education}
          onChange={(value) => updateField("education", value)}
          placeholder="Degree, university, dates, relevant modules, academic achievements..."
          rows={5}
        />

        <Textarea
          label="Projects"
          optional
          value={form.projects}
          onChange={(value) => updateField("projects", value)}
          placeholder="Project name, what you built, technologies used, your contribution and results..."
          rows={6}
        />

        <Textarea
          label="Certifications"
          optional
          value={form.certification}
          onChange={(value) => updateField("certification", value)}
          placeholder="CS50W, AWS certification, Microsoft certification..."
          rows={4}
        />
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={loading || quota.remaining <= 0}
          className="flex-1 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Creating & analysing..."
            : "Generate & analyse CV"}
        </button>

        <button
          type="button"
          onClick={clearForm}
          disabled={loading}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm text-zinc-400 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
      </div>

      {quota.remaining <= 0 && !quotaLoading && (
        <p className="mt-3 text-center text-xs text-zinc-600">
          You've reached today's AI limit.
        </p>
      )}
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-medium text-zinc-300">
          {label}
        </span>
      )}

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-purple-400/40 focus:bg-black/30"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
        {label}

        {optional && (
          <span className="text-xs font-normal text-zinc-600">
            optional
          </span>
        )}
      </span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-700 focus:border-purple-400/40 focus:bg-black/30"
      />
    </label>
  );
}