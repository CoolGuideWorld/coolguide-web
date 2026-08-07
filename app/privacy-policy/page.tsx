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

export default function PrivacyPolicyPage() {
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
            🔒
          </span>
          <p style={{ margin: 0, lineHeight: 1.6, color: "#3f362f" }}>
            Cette politique explique quelles données sont collectées par CoolGuide, pourquoi elles sont utilisées, comment elles sont protégées et quels sont vos droits conformément au RGPD.
          </p>
        </div>

        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 3.6vw, 2.8rem)", lineHeight: 1.2 }}>Politique de confidentialité</h1>

        <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>{linkifyText("Politique de Confidentialité — Application Coolguide")}</p>
        <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
          {linkifyText(
            "La présente Politique de Confidentialité a pour objectif d'informer les utilisateurs de l'application mobile Coolguide sur la manière dont leurs données à caractère personnel sont collectées, utilisées, stockées et protégées, conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et aux directives de la Google Play Console.",
          )}
        </p>

        <section style={{ display: "grid", gap: "0.9rem", marginTop: "0.6rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>1. Responsable du Traitement des Données</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Le responsable du traitement des données personnelles est l'équipe de développement de l'application Coolguide.")}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText(
              "Pour toute question relative à la protection de vos données ou pour exercer vos droits, vous pouvez nous contacter à l'adresse e-mail suivante : contact.coolguide@gmail.com",
            )}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem", marginTop: "0.6rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>2. Données Personnelles Collectées et Finalités</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText(
              "Nous collectons uniquement les données nécessaires au bon fonctionnement de l'application et de ses services d'accompagnement touristique audio :",
            )}
          </p>

          <h3 style={{ margin: "0.2rem 0 0", fontSize: "1.12rem", lineHeight: 1.5 }}>Données de Compte et d'Authentification (Email et Mot de passe) :</h3>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>{linkifyText("Finalité : Création de votre compte utilisateur, sécurisation des accès et gestion de la session.")}</li>
            <li>
              {linkifyText(
                "Précision de sécurité : Les procédures d'authentification s'appuient sur le service sécurisé Supabase Auth. Vos mots de passe sont directement cryptés et hachés par Supabase. L'équipe Coolguide n'a à aucun moment accès à votre mot de passe en clair.",
              )}
            </li>
          </ul>

          <h3 style={{ margin: "0.5rem 0 0", fontSize: "1.12rem", lineHeight: 1.5 }}>Photo de Profil / Avatar (Optionnel) :</h3>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>{linkifyText("Finalité : Personnalisation de l'interface utilisateur.")}</li>
            <li>
              {linkifyText(
                "Traitement : Si vous choisissez de télécharger une image ou une photo personnelle, celle-ci est associée de manière unique à votre identifiant anonymisé (ex: user_id.png) et hébergée sur l'infrastructure de stockage sécurisée de Supabase Storage. Vous pouvez à tout moment la modifier ou la supprimer.",
              )}
            </li>
            <li>
              {linkifyText(
                "Recommandation : Dans un souci de protection renforcée de votre vie privée, nous vous recommandons de privilégier l'utilisation d'un avatar personnalisé, d'une illustration ou de tout autre visuel de votre choix, plutôt que le téléchargement d'une photographie personnelle vous représentant directement.",
              )}
            </li>
          </ul>

          <h3 style={{ margin: "0.5rem 0 0", fontSize: "1.12rem", lineHeight: 1.5 }}>Données de Géolocalisation GPS (Position géographique) :</h3>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText(
              "Finalité : Déclenchement automatique et contextuel des explications audio touristiques selon votre position géographique.",
            )}
          </p>

          <h3 style={{ margin: "0.5rem 0 0", fontSize: "1.12rem", lineHeight: 1.5 }}>Données Techniques Liées à l'Affichage Cartographique :</h3>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText(
              "Coolguide s'appuie sur la bibliothèque technique react-native-maps, qui nécessite la présence d'une clé d'API Google Maps Platform pour des raisons de compatibilité technique avec le système d'exploitation. Toutefois, l'affichage cartographique effectif de l'application repose sur des fonds de carte OpenStreetMap, et non sur les services Google Maps. Aucune donnée personnelle n'est transmise à Google Maps Platform dans le cadre de cet usage : la clé d'API sert uniquement à l'initialisation technique du composant cartographique.",
            )}
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText(
              "Lors du chargement des fonds de carte, votre appareil adresse une requête technique aux serveurs de tuiles OpenStreetMap, qui peut inclure votre adresse IP, conformément au fonctionnement standard de tout service cartographique en ligne. Cette donnée est traitée par l'infrastructure OpenStreetMap à seule fin d'acheminement technique de la requête et n'est ni exploitée ni conservée par l'équipe Coolguide.",
            )}
          </p>

          <h3 style={{ margin: "0.5rem 0 0", fontSize: "1.12rem", lineHeight: 1.5 }}>
            Utilisation Spécifique de la Géolocalisation (Avant-plan et Arrière-plan)
          </h3>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText(
              "Afin d'assurer sa fonction de guide touristique immersif sans que vous n'ayez besoin de garder l'écran de votre smartphone constamment allumé, Coolguide utilise votre position GPS en arrière-plan (background location). Conformément aux exigences de Google Play, l'application affiche un écran explicatif dédié, présenté avant toute demande d'autorisation système, détaillant la finalité précise de cet accès :",
            )}
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>
              {linkifyText(
                "Mode Piéton : Lorsque vous vous déplacez à pied, la position GPS permet d'afficher une notification d'information dans un rayon de 250 m d'un point d'intérêt (POI), et d'activer automatiquement la lecture du guide audio lorsque vous arrivez à moins 75 m (si l'option Guide audio Automatique est activée dans votre profil).",
              )}
            </li>
            <li>
              {linkifyText(
                "Mode Voiture : Lors de vos déplacements routiers, la localisation déclenche un commentaire audio narratif sur les villes et agglomérations approchées dès l'entrée dans un rayon de 5 km.",
              )}
            </li>
            <li>
              {linkifyText(
                "Engagement de confidentialité des données GPS : Vos coordonnées GPS sont traitées uniquement en temps réel sur votre appareil pour calculer la proximité des points touristiques (formule de calcul de distance). Vos déplacements ne sont pas enregistrés de manière continue sous forme d'historique de traçage et ne sont jamais vendus ni partagés à des tiers.",
              )}
            </li>
          </ul>
        </section>

        <section style={{ display: "grid", gap: "0.9rem", marginTop: "0.6rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>3. Base Légale du Traitement</h2>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>
              {linkifyText(
                "Exécution du contrat (Art. 6.1.b du RGPD) : La collecte des identifiants et le traitement de la géolocalisation sont indispensables à la fourniture du service interactif de guide audio souscrit par l'utilisateur.",
              )}
            </li>
            <li>
              {linkifyText(
                "Consentement (Art. 6.1.a du RGPD) : L'accès aux fonctionnalités GPS (en particulier en arrière-plan) et l'importation de votre photo de profil nécessitent votre autorisation explicite via les permissions de l'application mobile. Ce consentement est libre, spécifique, éclairé et peut être retiré à tout moment.",
              )}
            </li>
          </ul>
        </section>

        <section style={{ display: "grid", gap: "0.9rem", marginTop: "0.6rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>4. Destinataires des Données et Sous-traitants</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText(
              "Vos données sont conservées de manière sécurisée et ne sont ni vendues, ni louées, ni transmises à aucun tiers à des fins commerciales ou publicitaires. Elles ne sont partagées qu'avec les prestataires techniques strictement nécessaires au fonctionnement de l'application, chacun agissant en tant que sous-traitant ou fournisseur technique encadré. Nous faisons appel au prestataire technique suivant, agissant en tant que sous-traitant conforme au RGPD :",
            )}
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>
              {linkifyText(
                "Supabase Inc. : Hébergement de la base de données d'authentification et du stockage sécurisé des images de profil (Supabase Storage & Auth). Les données sont hébergées sur des serveurs situés dans l'Union Européenne (région Europe de l'Ouest — Irlande), ce qui garantit qu'aucun transfert de données hors de l'Espace Économique Européen (EEE) n'est effectué dans le cadre de ce traitement.",
              )}
            </li>
            <li>
              {linkifyText(
                "• Expo / Expo Application Services (EAS) : Utilisé comme environnement technique de développement, de compilation (build) et de distribution des mises à jour de l'application. Ce prestataire peut être amené à traiter des identifiants techniques de l'application (ex : jetons de mise à jour, journaux de compilation) mais n'a pas accès à vos données personnelles de compte, de géolocalisation ou de profil.",
              )}
            </li>
            <li>
              {linkifyText(
                "Google Maps Platform : Sollicité uniquement pour des raisons de compatibilité technique de la bibliothèque cartographique utilisée. Aucune donnée personnelle n'est transmise à ce service, l'affichage des cartes reposant sur OpenStreetMap.",
              )}
            </li>
            <li>
              {linkifyText(
                "OpenStreetMap Foundation : Fournisseur des fonds de carte affichés dans l'application. Le chargement des tuiles cartographiques peut impliquer la transmission technique de votre adresse IP, à seule fin de délivrance du contenu cartographique.",
              )}
            </li>
          </ul>
        </section>

        <section style={{ display: "grid", gap: "0.9rem", marginTop: "0.6rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>5. Durée de Conservation des Données</h2>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>{linkifyText("Données de compte (Email, ID) & Photo de profil : Conservées pendant toute la durée d'activation de votre compte utilisateur.")}</li>
            <li>
              {linkifyText(
                "Données de géolocalisation : Traitées de manière instantanée et éphémère. Aucune donnée de parcours GPS n'est stockée de façon permanente sur nos serveurs.",
              )}
            </li>
            <li>
              {linkifyText(
                "Demande de suppression de compte : Le délai de suppression définitive de vos données de compte, de votre adresse e-mail et de votre photo de profil, au sein de nos systèmes et de ceux de nos sous-traitants, varie selon le canal utilisé pour formuler votre demande :",
              )}
            </li>
            <li>
              {linkifyText(
                "Demande adressée via la rubrique « Contact » : la suppression est effectuée dans un délai maximal de 30 jours suivant la confirmation de votre demande.",
              )}
            </li>
            <li>
              {linkifyText(
                "Suppression effectuée directement depuis l'application (menu « Mon profil » > « Supprimer mon compte ») : la suppression est immédiate.",
              )}
            </li>
          </ul>
        </section>

        <section style={{ display: "grid", gap: "0.9rem", marginTop: "0.6rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>6. Transferts Internationaux de Données</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText(
              "L'ensemble des données personnelles traitées par Coolguide (compte, authentification, stockage des photos de profil) est hébergé au sein de l'Union Européenne, sur des serveurs Supabase situés en Irlande. Aucun transfert de données personnelles vers un pays situé hors de l'Espace Économique Européen n'est effectué à ce jour. Si cela venait à évoluer, les utilisateurs en seraient informés et les garanties appropriées prévues par le RGPD (notamment les Clauses Contractuelles Types) seraient mises en œuvre.",
            )}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem", marginTop: "0.6rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>7. Absence de Décision Automatisée et de Profilage</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText(
              "Coolguide n'effectue aucun profilage de ses utilisateurs et ne recourt à aucune prise de décision entièrement automatisée produisant des effets juridiques ou vous affectant de manière significative, au sens de l'article 22 du RGPD.",
            )}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem", marginTop: "0.6rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>8. Sécurité des Données</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText(
              "Nous mettons en œuvre les mesures techniques et organisationnelles suivantes pour assurer la protection de vos données :",
            )}
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>{linkifyText("Chiffrement des communications entre l'application et les serveurs via le protocole HTTPS (TLS/SSL).")}</li>
            <li>
              {linkifyText(
                "Hachage et chiffrement des mots de passe, gérés directement par Supabase Auth, sans accès en clair par l'équipe Coolguide.",
              )}
            </li>
            <li>{linkifyText("Chiffrement des données au repos sur l'infrastructure de stockage Supabase.")}</li>
            <li>
              {linkifyText(
                "Accès aux données restreint aux seules personnes habilitées, dans le cadre strict du développement et de la maintenance de l'application.",
              )}
            </li>
          </ul>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText(
              "En cas de violation de données personnelles susceptible d'engendrer un risque pour vos droits et libertés, nous nous engageons à notifier cet incident à la Commission Nationale de l'Informatique et des Libertés (CNIL) dans un délai de 72 heures, conformément à l'article 33 du RGPD, et à vous en informer directement si le risque est élevé.",
            )}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem", marginTop: "0.6rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>9. Utilisateurs Mineurs</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>{linkifyText("Coolguide n'est pas destinée à un public mineur.")}</p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>
              {linkifyText(
                "Paramétrage et filtrage sur le Google Play Store : Conformément au règlement de la Google Play Console relatif au public cible et au contenu, notre application est officiellement déclarée comme non destinée aux mineurs de moins de 18 ans. En conséquence, Google Play applique ses mécanismes de protection et de restriction d'accès (filtrage du catalogue selon l'âge du compte Google, contrôle parental Family Link et masquage dans le Store pour les comptes identifiés comme mineurs).",
              )}
            </li>
            <li>
              {linkifyText(
                "Absence de collecte de données de mineurs : Nous ne collectons, ne sollicitons ni ne traitons sciemment aucune donnée à caractère personnel auprès de personnes âgées de moins de 18 ans.",
              )}
            </li>
          </ul>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText(
              "Si vous êtes un parent ou un tuteur légal et que vous constatez qu'un enfant sous votre responsabilité nous a transmis des informations personnelles sans votre consentement, vous pouvez nous contacter afin que nous procédions à leur suppression.",
            )}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem", marginTop: "0.6rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>10. Vos Droits (RGPD) et Suppression des Données</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :")}
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>{linkifyText("Droit d'accès et de rectification : Vous pouvez consulter et modifier votre profil directement dans l'application.")}</li>
            <li>
              {linkifyText(
                "Droit à l'effacement (Droit à l'oubli) : Vous pouvez demander à tout moment la suppression définitive de votre compte, de votre adresse e-mail et de votre photo de profil. Cette suppression peut être effectuée de manière autonome et immédiate directement depuis l'application, via l'option « Supprimer mon compte », accessible dans le menu « Mon profil ». Elle peut également être demandée en dehors de l'application, via notre formulaire de suppression en ligne accessible à l'adresse suivante : contact.coolguide@gmail.com, conformément aux exigences de la Google Play Console applicables aux applications proposant la création de compte.",
              )}
            </li>
            <li>
              {linkifyText(
                "Droit à la portabilité des données : Vous pouvez demander à recevoir les données personnelles que vous nous avez fournies dans un format structuré, couramment utilisé et lisible par machine.",
              )}
            </li>
            <li>
              {linkifyText(
                "Droit d'opposition : Vous pouvez vous opposer, pour des motifs légitimes, à un traitement de vos données reposant sur notre intérêt légitime.",
              )}
            </li>
            <li>
              {linkifyText(
                "Droit à la limitation du traitement : Vous pouvez demander la limitation du traitement de vos données dans certaines situations prévues par le RGPD, notamment en cas de contestation de leur exactitude.",
              )}
            </li>
            <li>
              {linkifyText(
                "Droit d'introduire une réclamation : Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL), autorité de contrôle compétente en France, via le site www.cnil.fr.",
              )}
            </li>
            <li>
              {linkifyText(
                "Droit de retrait du consentement : Vous pouvez désactiver l'accès à la géolocalisation à tout moment via les paramètres de votre système d'exploitation mobile (Android / iOS).",
              )}
            </li>
          </ul>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText(
              "Pour exercer vos droits ou demander la suppression complète de vos données, vous pouvez formuler votre demande par e-mail à : contact.coolguide@gmail.com. Nous nous engageons à répondre à toute demande dans un délai maximal d'un mois, conformément à l'article 12 du RGPD.",
            )}
          </p>
        </section>

        <section style={{ display: "grid", gap: "0.9rem", marginTop: "0.6rem" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", lineHeight: 1.3 }}>7. Exigences de la Google Play Console</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#475569" }}>
            {linkifyText("En conformité avec les règles de Google Play relatives aux données utilisateur :")}
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "grid", gap: "0.45rem", color: "#475569", lineHeight: 1.8 }}>
            <li>{linkifyText("L'application demande explicitement l'autorisation de géolocalisation en arrière-plan au moment opportun.")}</li>
            <li>
              {linkifyText(
                "Une procédure de suppression de compte est proposée à la fois directement depuis l'application (menu « Mon profil » > « Supprimer mon compte ») et via une page web externe accessible sans nécessiter la réinstallation de l'application, conformément aux exigences applicables aux applications permettant la création de compte.",
              )}
            </li>
            <li>
              {linkifyText(
                "Aucune donnée sensible n'est transmise non chiffrée. Les communications entre l'application et les serveurs Supabase sont intégralement chiffrées via HTTPS (TLS/SSL).",
              )}
            </li>
            <li>
              {linkifyText(
                "Aucun kit de développement logiciel (SDK) publicitaire ou de suivi comportemental n'est intégré à l'application. Les seuls services techniques tiers utilisés (Expo/EAS pour le développement et la distribution, clé d'API Google Maps Platform pour compatibilité technique uniquement, et OpenStreetMap pour l'affichage cartographique) ne collectent ni n'exploitent de données personnelles à des fins publicitaires ou de profilage.",
              )}
            </li>
          </ul>
        </section>

        <p style={{ margin: "0.5rem 0 0", textAlign: "center", color: "#475569", lineHeight: 1.6 }}>
          © 2026 Coolguide App — Tous droits réservés.
        </p>
      </div>
    </main>
  );
}
