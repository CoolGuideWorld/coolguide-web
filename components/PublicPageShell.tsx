import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

type PublicPageShellProps = {
  title: string;
  message: string;
  headerSolid?: boolean;
  localLinks?: Array<{
    href: string;
    label: string;
  }>;
};

export default function PublicPageShell({
  title,
  message,
  headerSolid = true,
  localLinks = [],
}: PublicPageShellProps) {
  return (
    <>
      <SiteHeader initialSolid={headerSolid} />

      <main
        style={{
          minHeight: "calc(100vh - var(--header-height))",
          background: "#f4ede2",
          color: "#1f1a17",
          display: "grid",
          placeItems: "center",
          padding: "clamp(3rem, 7vw, 6rem) 1.25rem",
        }}
      >
        <div style={{ maxWidth: "760px", textAlign: "center" }}>
          <p
            style={{
              margin: "0 0 0.85rem",
              fontSize: "0.9rem",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#7d6f60",
            }}
          >
            CoolGuide World
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2rem, 5vw, 4rem)",
              fontWeight: 300,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </h1>

          <p
            style={{
              margin: "1rem auto 0",
              maxWidth: "44ch",
              fontSize: "clamp(1rem, 1.6vw, 1.15rem)",
              lineHeight: 1.7,
              color: "#4d433a",
            }}
          >
            {message}
          </p>

          {localLinks.length > 0 ? (
            <nav
              aria-label="Navigation de section"
              style={{
                marginTop: "1.75rem",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "0.75rem",
              }}
            >
              {localLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "44px",
                    padding: "0.8rem 1.1rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(31, 26, 23, 0.14)",
                    color: "#1f1a17",
                    textDecoration: "none",
                    fontSize: "0.98rem",
                    background: "rgba(255, 255, 255, 0.24)",
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}