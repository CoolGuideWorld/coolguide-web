"use client";

export default function DownloadSection() {
  const openRecruitmentPopup = () => {
    const recruitmentButton = document.querySelector<HTMLButtonElement>(
      'button[aria-controls="download-recruitment-dialog"]'
    );

    recruitmentButton?.click();
  };

  return (
    <section className="conclusionSection" id="download">
      <div className="conclusionInner">
        <p className="conclusionFreeBadge">
          <span className="conclusionFreeBadgeDot" aria-hidden="true" />
          Beta CoolGuide
        </p>
        <h2 className="conclusionTitle">DEVENEZ TESTEUR COOLGUIDE</h2>
        <p className="conclusionText">
          Vous habitez dans une ville deja presente sur CoolGuide ou vous la connaissez bien ?
        </p>
        <p className="conclusionText">
          Testez l&apos;application et aidez-nous a ameliorer l&apos;experience, les contenus et les decouvertes locales.
        </p>
        <div className="storeButtons" aria-label="Choisir une plateforme beta">
          <div>
            <a
              href="https://testflight.apple.com/join/N7EGZakr"
              className="storeButton"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Tester CoolGuide sur iPhone avec TestFlight, ouverture dans un nouvel onglet"
            >
              Tester CoolGuide sur iPhone
            </a>
            <p className="conclusionMeta">Installation via TestFlight</p>
          </div>
          <div>
            <button type="button" className="storeButton" onClick={openRecruitmentPopup}>
              Tester CoolGuide sur Android
            </button>
            <p className="conclusionMeta">Acces beta sur invitation Google Play</p>
          </div>
        </div>
      </div>
    </section>
  );
}
