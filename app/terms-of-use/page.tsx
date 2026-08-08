function linkifyText(text: string): React.ReactNode[] {
  const pattern = /((?:https?:\/\/|www\.)[^\s)]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) {
      return null;
    }

    const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(part);
    if (isEmail) {
      return (
        <a key={`${part}-${index}`} href={`mailto:${part}`} style={{ color: "#0f7a45", textDecoration: "underline" }}>
          {part}
        </a>
      );
    }

    const isUrl = /^(?:https?:\/\/|www\.)/i.test(part);
    if (isUrl) {
      const href = /^https?:\/\//i.test(part) ? part : `https://${part}`;
      return (
        <a
          key={`${part}-${index}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#0f7a45", textDecoration: "underline" }}
        >
          {part}
        </a>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export default function TermsOfUsePage() {
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
          <span aria-hidden="true" style={{ fontSize: "1.15rem", lineHeight: 1 }}>
            📘
          </span>
          <p style={{ margin: 0, lineHeight: 1.6, color: "#3f362f" }}>
            Ces Conditions Générales d&apos;Utilisation définissent les règles applicables à l&apos;utilisation des services CoolGuide.
          </p>
        </div>

        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 3.6vw, 2.8rem)", lineHeight: 1.2 }}>
          Conditions d&apos;utilisation (CGU)
        </h1>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("CONDITIONS D'UTILISATION DE COOLGUIDE")}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Dernière mise à jour : 08/08/2026")}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Bienvenue sur CoolGuide, une application dédiée à la découverte touristique, culturelle et historique des territoires. En créant un compte et en utilisant CoolGuide, vous acceptez les présentes Conditions Générales d'Utilisation (« CGU »).")}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>1. Utilisation de CoolGuide</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("CoolGuide permet notamment aux utilisateurs de découvrir des lieux d'intérêt, monuments, sites historiques, culturels et touristiques, d'écouter des contenus audios et de personnaliser leur expérience de découverte.")}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("L'utilisation de CoolGuide doit rester conforme aux présentes CGU, aux lois et règlements applicables ainsi qu'aux règles de respect des autres utilisateurs.")}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>2. Informations du profil</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("A la suite de la création de votre compte, CoolGuide peut vous permettre de renseigner notamment :")}
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>{linkifyText("un nom d’avatar ou pseudonyme ;")}</li>
            <li>{linkifyText("un Avatar, une photo de profil ;")}</li>
          </ul>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Le nom ou pseudonyme et l’avatar ou la photo de profil peuvent être utilisés selon votre souhait pour personnaliser votre profil dans l'application et, lorsque les fonctionnalités de CoolGuide le permettent, être visibles par d'autres utilisateurs.")}
          </p>

          <h3 style={{ margin: "0.2rem 0 0", fontSize: "1.12rem", lineHeight: 1.5 }}>2.1 Nom ou pseudonyme</h3>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("L'utilisateur s'engage à choisir un nom ou pseudonyme qui ne :")}
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>{linkifyText("usurpe pas l'identité d'une autre personne ;")}</li>
            <li>{linkifyText("ne prétend pas représenter une personne, une entreprise ou une organisation sans autorisation ;")}</li>
            <li>{linkifyText("ne contient pas de propos haineux, discriminatoires, menaçants ou diffamatoires ;")}</li>
            <li>{linkifyText("ne comporte pas de contenu sexuellement explicite ;")}</li>
            <li>{linkifyText("ne fait pas l'apologie d'activités illégales ou dangereuses ;")}</li>
            <li>{linkifyText("ne porte pas atteinte aux droits, à la réputation ou à la vie privée d'autrui ;")}</li>
            <li>{linkifyText("ne constitue pas une tentative de contourner les règles de CoolGuide.")}</li>
          </ul>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("CoolGuide peut demander la modification d'un nom ou pseudonyme qui ne respecte pas ces règles.")}
          </p>

          <h3 style={{ margin: "0.2rem 0 0", fontSize: "1.12rem", lineHeight: 1.5 }}>2.2 Photo de profil</h3>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("La photo de profil doit respecter les mêmes principes de respect et de sécurité.")}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Il est notamment interdit de publier une image :")}
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>{linkifyText("représentant une autre personne sans disposer des droits ou autorisations nécessaires ;")}</li>
            <li>{linkifyText("présentant un contenu pornographique ou sexuellement explicite ;")}</li>
            <li>{linkifyText("faisant l'apologie de la haine, de la violence ou d'organisations extrémistes ;")}</li>
            <li>{linkifyText("présentant un contenu illégal ou manifestement choquant ;")}</li>
            <li>{linkifyText("portant atteinte à la vie privée, à l'image ou aux droits d'un tiers ;")}</li>
            <li>{linkifyText("utilisée pour usurper l'identité d'une autre personne ;")}</li>
            <li>{linkifyText("contenant principalement de la publicité ou du contenu promotionnel non autorisé.")}</li>
          </ul>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("L'utilisateur garantit disposer des droits nécessaires pour utiliser la photo qu'il ajoute à son profil.")}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>3. Comportements interdits</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("L'utilisateur s'engage à ne pas utiliser CoolGuide pour :")}
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>{linkifyText("harceler, menacer ou intimider une autre personne ;")}</li>
            <li>{linkifyText("publier ou transmettre des contenus illégaux ;")}</li>
            <li>{linkifyText("diffuser des contenus haineux ou discriminatoires ;")}</li>
            <li>{linkifyText("usurper l'identité d'un tiers ;")}</li>
            <li>{linkifyText("tenter d'obtenir frauduleusement les informations personnelles d'un autre utilisateur ;")}</li>
            <li>{linkifyText("contourner les mécanismes de sécurité de l'application ;")}</li>
            <li>{linkifyText("perturber volontairement le fonctionnement du service ;")}</li>
            <li>{linkifyText("utiliser des systèmes automatisés pour collecter ou extraire massivement les données de CoolGuide sans autorisation ;")}</li>
            <li>{linkifyText("utiliser CoolGuide à des fins frauduleuses, commerciales ou illégales.")}</li>
          </ul>
        </section>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>4. Signalement et modération</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Tout utilisateur peut signaler un profil, une photo ou tout autre contenu qu'il estime contraire aux présentes CGU à l’adresse suivante : contact.coolguide@gmail.com")}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("CoolGuide peut examiner les contenus signalés et prendre toute mesure raisonnable nécessaire à la protection de ses utilisateurs et au respect de ses règles.")}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Selon la gravité de la situation, CoolGuide peut notamment :")}
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>{linkifyText("demander la modification ou la suppression d'un contenu ;")}</li>
            <li>{linkifyText("retirer une photo ou un élément de profil ;")}</li>
            <li>{linkifyText("limiter temporairement certaines fonctionnalités ;")}</li>
            <li>{linkifyText("suspendre temporairement un compte ;")}</li>
            <li>{linkifyText("supprimer définitivement un compte ;")}</li>
            <li>{linkifyText("prendre toute mesure nécessaire lorsqu'une obligation légale l'impose.")}</li>
          </ul>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Les mesures peuvent être prises notamment en cas de contenu manifestement illégal, dangereux, frauduleux, haineux, abusif ou portant atteinte aux droits d'autrui.")}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>5. Suspension ou suppression du compte</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("CoolGuide peut suspendre ou supprimer un compte lorsqu'il existe des raisons sérieuses de considérer que l'utilisateur :")}
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>{linkifyText("viole les présentes CGU ;")}</li>
            <li>{linkifyText("utilise le service à des fins frauduleuses ou illégales ;")}</li>
            <li>{linkifyText("porte atteinte à la sécurité du service ou à celle d'autres utilisateurs ;")}</li>
            <li>{linkifyText("publie de manière répétée des contenus interdits ;")}</li>
            <li>{linkifyText("tente de contourner une suspension ou une mesure de sécurité.")}</li>
          </ul>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Lorsque cela est approprié et possible, CoolGuide peut informer l'utilisateur de la mesure prise et de son motif.")}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("La suppression d'un compte entraîne la suppression des données personnelles associées conformément à la Politique de confidentialité de CoolGuide, sous réserve des données dont la conservation est légalement nécessaire ou justifiée.")}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>6. Données de localisation</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("CoolGuide peut utiliser la position GPS de l'appareil afin de permettre certaines fonctionnalités, notamment la recherche de lieux d'intérêt situés à proximité de l'utilisateur. La position est utilisée uniquement pour fournir une fonctionnalité en temps réel, CoolGuide ne conserve pas d'historique des déplacements de l'utilisateur.")}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Cette position est traitée uniquement pendant la durée nécessaire au fonctionnement de la fonctionnalité concernée, conformément à notre Politique de confidentialité.")}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("L'utilisateur peut gérer l'autorisation de localisation dans les paramètres de son appareil.")}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>7. Favoris</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("CoolGuide peut permettre à l'utilisateur d'enregistrer des lieux d'intérêt dans une liste de favoris.")}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Ces favoris sont associés à son compte et sont destinés à personnaliser son expérience.")}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Les favoris d'un utilisateur ne sont pas publiés ni rendus accessibles aux autres utilisateurs.")}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>8. Respect de la vie privée</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("CoolGuide accorde une importance particulière à la protection des données personnelles.")}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Les modalités de collecte, d'utilisation, de conservation et de suppression des données personnelles sont détaillées dans la Politique de confidentialité de CoolGuide. Cette politique précise notamment les traitements concernant l'adresse e-mail, le nom ou pseudonyme, la photo de profil, les données de localisation et les favoris.")}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>9. Suppression du compte</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("L'utilisateur peut demander la suppression de son compte depuis l'application et/ou depuis la page dédiée disponible sur le site de CoolGuide. La suppression entraîne la suppression immédiate de toutes les données personnelles associées au compte dans les conditions précisées dans la Politique de confidentialité.")}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>10. Évolution des règles</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("CoolGuide peut faire évoluer les présentes CGU afin de tenir compte de l'évolution de ses fonctionnalités, de la réglementation ou des exigences de sécurité. La version applicable est celle publiée sur le site de CoolGuide à la date d'utilisation du service.")}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>11. Contact</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Pour toute question concernant les présentes CGU ou le fonctionnement de CoolGuide, vous pouvez nous contacter à l’adresse suivante : contact.coolguide@gmail.com")}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>12. Acceptation</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Lors de la création de son compte, l'utilisateur confirme avoir pris connaissance des présentes Conditions Générales d'Utilisation, confirme les accepter et s’engage à les respecter.")}
          </p>
        </section>
      </div>
    </main>
  );
}
