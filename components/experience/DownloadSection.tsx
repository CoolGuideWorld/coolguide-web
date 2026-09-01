export default function DownloadSection() {
  return (
    <section className="conclusionSection" id="download">
      <div className="conclusionInner">
        <p className="conclusionFreeBadge">
          <span className="conclusionFreeBadgeDot" aria-hidden="true" />
          Beta iPhone via TestFlight
        </p>
        <h2 className="conclusionTitle">DEVENEZ TESTEUR COOLGUIDE</h2>
        <p className="conclusionText">
          Vous habitez dans une ville deja presente sur CoolGuide ou vous la connaissez bien ?
        </p>
        <p className="conclusionText">
          Testez l&apos;application sur iPhone et aidez-nous a ameliorer l&apos;experience, les contenus et les decouvertes locales.
        </p>
        <div className="storeButtons" aria-label="Inscription beta iPhone">
          <a
            href="https://testflight.apple.com/join/N7EGZakr"
            className="storeButton"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Tester CoolGuide sur iPhone avec TestFlight, ouverture dans un nouvel onglet"
          >
            Tester CoolGuide sur iPhone
          </a>
        </div>
        <p className="conclusionMeta">Version beta gratuite via TestFlight</p>
      </div>
    </section>
  );
}
