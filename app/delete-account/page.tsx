export default function DeleteAccountPage() {
  return (
    <main style={{ background: "#fcfaf6", color: "#1f1a17" }}>
      <div
        style={{
          width: "min(100% - 2rem, 980px)",
          marginInline: "auto",
          padding: "calc(clamp(6.8rem, 9vw, 8.6rem) + 12px) 0 clamp(2.5rem, 4vw, 3.5rem)",
          display: "grid",
          gap: "clamp(1.1rem, 2.2vw, 1.6rem)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            alignItems: "start",
            gap: "0.75rem",
            background: "#f4ede2",
            border: "1px solid rgba(31, 26, 23, 0.1)",
            borderRadius: "16px",
            padding: "0.95rem 1rem",
          }}
        >
          <span aria-hidden="true" style={{ fontSize: "1.15rem", lineHeight: 1 }}>ℹ️</span>
          <p style={{ margin: 0, lineHeight: 1.6, color: "#3f362f" }}>
            Vous pouvez supprimer votre compte à tout moment, soit directement depuis l&apos;application, soit en nous contactant par e-mail.
          </p>
        </div>

        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 3.6vw, 2.8rem)", lineHeight: 1.2 }}>
          Procédure de suppression de compte
        </h1>

        <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
          La présente Politique de Confidentialité a pour objectif d&apos;informer les utilisateurs de l&apos;application mobile Coolguide sur la manière de supprimer leur compte ainsi que les données associées conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et aux directives de la Google Play Console.
        </p>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>
            1. Suppression du compte
          </h2>

          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            Une procédure de suppression de compte est proposée à la fois directement depuis l&apos;application (menu « Mon profil » &gt; « Supprimer mon compte ») et via une page web externe accessible sans nécessiter la réinstallation de l&apos;application, conformément aux exigences applicables aux applications permettant la création de compte.
          </p>

          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            Pour demander la suppression complète de vos données, vous pouvez formuler votre demande par e-mail à :{" "}
            <a href="mailto:contact.coolguide@gmail.com" style={{ color: "#0f7a45", textDecoration: "underline" }}>
              contact.coolguide@gmail.com
            </a>
            . Nous nous engageons à répondre à toute demande dans un délai maximal d&apos;un mois, conformément à l&apos;article 12 du RGPD.
          </p>

          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            La Suppression effectuée directement depuis l&apos;application (menu « Mon profil » &gt; « Supprimer mon compte ») : est immédiate.
          </p>

          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            La suppression du compte entraîne l&apos;effacement de l&apos;ensemble des données utilisateurs (adresse email, mot de passe, photo de profil associée si existante).
          </p>
        </section>

        <p style={{ margin: "0.5rem 0 0", textAlign: "center", color: "#475569", lineHeight: 1.6 }}>
          © 2026 Coolguide App — Tous droits réservés.
        </p>
      </div>
    </main>
  );
}
