import ReactMarkdown from "react-markdown";

type CVPreviewProps = {
  editedCV: string;
  cvPreviewRef: React.RefObject<HTMLDivElement | null>;
};

export default function CVPreview({
  editedCV,
  cvPreviewRef,
}: CVPreviewProps) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-white/10 bg-zinc-900/60 p-3 sm:p-5">
      <div
        ref={cvPreviewRef}
        className="mx-auto w-full max-w-[794px]"
        style={{
          minHeight: "1123px",
          backgroundColor: "#ffffff",
          color: "#202020",
          padding: "42px 46px",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "10.5px",
          lineHeight: 1.48,
          boxSizing: "border-box",
        }}
      >
        <ReactMarkdown
          components={{
            /* =========================
               NAME
            ========================= */

            h1: ({ children }) => (
              <h1
                style={{
                  margin: "0 0 5px 0",
                  color: "#111111",
                  fontSize: "29px",
                  fontWeight: 700,
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                }}
              >
                {children}
              </h1>
            ),

            /* =========================
               SECTION HEADINGS
            ========================= */

            h2: ({ children }) => (
              <h2
                style={{
                  margin: "21px 0 10px 0",
                  paddingBottom: "7px",
                  color: "#111111",
                  borderBottom: "1px solid #cfcfcf",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  pageBreakAfter: "avoid",
                }}
              >
                {children}
              </h2>
            ),

            /* =========================
               SUBHEADINGS
            ========================= */

            h3: ({ children }) => (
              <h3
                style={{
                  margin: "11px 0 3px 0",
                  color: "#171717",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  pageBreakAfter: "avoid",
                }}
              >
                {children}
              </h3>
            ),

            /* =========================
               PARAGRAPHS
            ========================= */

            p: ({ children }) => (
              <p
                style={{
                  margin: "0 0 7px 0",
                  color: "#333333",
                  fontSize: "10.5px",
                  lineHeight: 1.48,
                  pageBreakInside: "avoid",
                }}
              >
                {children}
              </p>
            ),

            /* =========================
               UNORDERED LISTS
            ========================= */

            ul: ({ children }) => (
              <ul
                style={{
                  margin: "3px 0 8px 0",
                  paddingLeft: "18px",
                  color: "#333333",
                  fontSize: "10.5px",
                  lineHeight: 1.45,
                  listStyleType: "disc",
                }}
              >
                {children}
              </ul>
            ),

            /* =========================
               ORDERED LISTS
            ========================= */

            ol: ({ children }) => (
              <ol
                style={{
                  margin: "3px 0 8px 0",
                  paddingLeft: "18px",
                  color: "#333333",
                  fontSize: "10.5px",
                  lineHeight: 1.45,
                  listStyleType: "decimal",
                }}
              >
                {children}
              </ol>
            ),

            /* =========================
               LIST ITEMS
            ========================= */

            li: ({ children }) => (
              <li
                style={{
                  marginBottom: "3px",
                  paddingLeft: "2px",
                  color: "#333333",
                  pageBreakInside: "avoid",
                }}
              >
                {children}
              </li>
            ),

            /* =========================
               BOLD
            ========================= */

            strong: ({ children }) => (
              <strong
                style={{
                  color: "#111111",
                  fontWeight: 700,
                }}
              >
                {children}
              </strong>
            ),

            /* =========================
               ITALIC
            ========================= */

            em: ({ children }) => (
              <em
                style={{
                  color: "#555555",
                  fontStyle: "italic",
                }}
              >
                {children}
              </em>
            ),

            /* =========================
               LINKS
            ========================= */

            a: ({ children, href }) => (
              <a
                href={href}
                style={{
                  color: "#222222",
                  textDecoration: "none",
                }}
              >
                {children}
              </a>
            ),

            /* =========================
               HORIZONTAL RULE
            ========================= */

            hr: () => (
              <hr
                style={{
                  margin: "10px 0 14px 0",
                  border: 0,
                  borderTop: "1px solid #d6d6d6",
                }}
              />
            ),

            /* =========================
               CODE
            ========================= */

            code: ({ children }) => (
              <code
                style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "10px",
                  color: "#333333",
                }}
              >
                {children}
              </code>
            ),
          }}
        >
          {editedCV}
        </ReactMarkdown>
      </div>
    </div>
  );
}