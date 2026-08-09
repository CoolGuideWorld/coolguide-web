import Image from "next/image";
import styles from "./city.module.css";
import type { CityHeroData } from "@/types/city";

type CityHeroProps = {
  hero: CityHeroData;
};

export default function CityHero({ hero }: CityHeroProps) {
  const heroImageSrc =
    typeof hero.imageSrc === "string" && hero.imageSrc.trim().length > 0
      ? hero.imageSrc.trim()
      : null;
  const heroImageAlt =
    typeof hero.imageAlt === "string" && hero.imageAlt.trim().length > 0
      ? hero.imageAlt
      : `${hero.name} - destination CoolGuide`;

  return (
    <section className={styles.hero} aria-label={`Destination ${hero.name}`}>
      {heroImageSrc ? (
        <Image
          className={styles.heroImage}
          src={heroImageSrc}
          alt={heroImageAlt}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 1220px"
        />
      ) : null}
      <div className={styles.heroShade} aria-hidden="true" />

      <div className={styles.heroContent}>
        <p className={styles.heroMeta}>{hero.location}</p>
        <h1 className={styles.heroName}>{hero.name}</h1>
        <p className={styles.heroTagline}>{hero.tagline}</p>
      </div>
    </section>
  );
}
