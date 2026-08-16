"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import styles from "@/app/studio/studio.module.css";
import {
  decideCircuitProposalAction,
  publishCircuitProposalAction,
  saveCircuitEditorialDraftAction,
  type CircuitPublishState,
  type CircuitDecisionState,
  type CircuitEditorialDraftSaveState,
} from "@/app/studio/(private)/circuits/actions";

export type StudioCircuitItem = {
  id: string;
  destinationStrategique: string;
  pivot: string | null;
  stops: string[];
  stopCount: number | null;
  score: number | null;
  confidenceLevel: string | null;
  sourceCircuitLabel: string | null;
  status: string;
  createdAt: string | null;
  sourceCircuitId: string | null;
  linkedCircuitId: string | null;
  missionId: string | null;
  decisionId: string | null;
  findings: string[];
  editorialDraft: CircuitEditorialDraft | null;
  existingCircuitId: string | null;
  existingCircuitSlug: string | null;
  canPublish: boolean;
};

export type CircuitEditorialDraft = {
  version: string;
  language: string;
  title: string;
  subtitle: string;
  short_description: string;
  introduction: string;
  estimated_duration: string;
  seo_title: string;
  seo_description: string;
  stops: CircuitEditorialDraftStop[];
};

export type CircuitEditorialDraftStop = {
  position: number;
  slug: string;
  name: string;
  editorial_summary: string;
};

export type StudioCircuitsMetrics = {
  totalProposals: number;
  pendingProposals: number;
  approvedProposals: number;
  rejectedProposals: number;
  totalCircuits: number;
};

type StudioCircuitsWorkbenchProps = {
  proposals: StudioCircuitItem[];
  metrics: StudioCircuitsMetrics;
  dataWarnings: string[];
};

const initialDecisionState: CircuitDecisionState = {
  error: "",
  success: "",
};

const initialDraftSaveState: CircuitEditorialDraftSaveState = {
  error: "",
  success: "",
};

const initialPublishState: CircuitPublishState = {
  error: "",
  success: "",
};

type EditableDraftState = {
  title: string;
  subtitle: string;
  short_description: string;
  introduction: string;
  estimated_duration: string;
  seo_title: string;
  seo_description: string;
  stops: CircuitEditorialDraftStop[];
};

function DecisionButtons() {
  const { pending } = useFormStatus();

  return (
    <div className={styles.decisionButtonsRow}>
      <button
        type="submit"
        name="decision"
        value="approved"
        className={styles.primaryButton}
        disabled={pending}
      >
        {pending ? "Validation..." : "Approuver"}
      </button>
      <button
        type="submit"
        name="decision"
        value="rejected"
        className={styles.secondaryDangerButton}
        disabled={pending}
      >
        {pending ? "Validation..." : "Rejeter"}
      </button>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Date non disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const datePart = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${datePart}, ${timePart}`;
}

function formatStatus(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "proposed") {
    return "À examiner";
  }

  if (normalized === "approved") {
    return "Approuvé";
  }

  if (normalized === "rejected") {
    return "Rejeté";
  }

  if (normalized === "published") {
    return "Publié";
  }

  if (normalized.includes("appr") || normalized.includes("valid")) {
    return "Approuvé";
  }

  if (normalized.includes("rej") || normalized.includes("refus")) {
    return "Rejeté";
  }

  if (normalized.includes("draft") || normalized.includes("brouillon")) {
    return "Brouillon";
  }

  if (normalized.includes("progress") || normalized.includes("cours")) {
    return "En cours";
  }

  if (normalized === "pending" || normalized.includes("attente") || normalized.includes("review")) {
    return "En attente";
  }

  return status;
}

function statusTone(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "approved" || normalized === "published") {
    return styles.statusOk;
  }

  if (normalized === "rejected") {
    return styles.statusError;
  }

  if (normalized.includes("appr") || normalized.includes("valid")) {
    return styles.statusOk;
  }

  if (normalized.includes("rej") || normalized.includes("refus")) {
    return styles.statusError;
  }

  return styles.statusNeutral;
}

function formatConfidenceLevel(value: string | null) {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return "-";
  }

  if (normalized === "high") {
    return "Élevée";
  }

  if (normalized === "medium") {
    return "Moyenne";
  }

  if (normalized === "low") {
    return "Faible";
  }

  return value ?? "-";
}

function formatStops(stops: string[]) {
  if (stops.length === 0) {
    return "-";
  }

  return stops.join(" → ");
}

function formatDraftStops(stops: CircuitEditorialDraftStop[]) {
  return [...stops].sort((a, b) => a.position - b.position);
}

function toEditableDraftState(draft: CircuitEditorialDraft): EditableDraftState {
  return {
    title: draft.title,
    subtitle: draft.subtitle,
    short_description: draft.short_description,
    introduction: draft.introduction,
    estimated_duration: draft.estimated_duration,
    seo_title: draft.seo_title,
    seo_description: draft.seo_description,
    stops: formatDraftStops(draft.stops).map((stop) => ({
      ...stop,
      editorial_summary: stop.editorial_summary,
    })),
  };
}

export default function StudioCircuitsWorkbench(props: StudioCircuitsWorkbenchProps) {
  const { proposals, metrics } = props;
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(proposals[0]?.id ?? null);
  const [decisionState, decisionAction] = useActionState(
    decideCircuitProposalAction,
    initialDecisionState
  );
  const [draftSaveState, setDraftSaveState] = useState<CircuitEditorialDraftSaveState>(
    initialDraftSaveState
  );
  const [isSavingDraft, startDraftSaveTransition] = useTransition();
  const [publishState, setPublishState] = useState<CircuitPublishState>(initialPublishState);
  const [isPublishing, startPublishTransition] = useTransition();
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [showPublishConfirmation, setShowPublishConfirmation] = useState(false);
  const [editableDraft, setEditableDraft] = useState<EditableDraftState | null>(null);

  const selectedProposal = useMemo(
    () => proposals.find((proposal) => proposal.id === selectedId) ?? null,
    [proposals, selectedId]
  );

  useEffect(() => {
    if (decisionState.success) {
      router.refresh();
    }
  }, [decisionState.success, router]);

  const canEditDraft =
    selectedProposal?.status === "approved" && !!selectedProposal.editorialDraft;

  const draftPayload =
    selectedProposal?.editorialDraft && editableDraft
      ? JSON.stringify({
          version: selectedProposal.editorialDraft.version,
          language: selectedProposal.editorialDraft.language,
          title: editableDraft.title,
          subtitle: editableDraft.subtitle,
          short_description: editableDraft.short_description,
          introduction: editableDraft.introduction,
          estimated_duration: editableDraft.estimated_duration,
          seo_title: editableDraft.seo_title,
          seo_description: editableDraft.seo_description,
          stops: editableDraft.stops.map((stop) => ({
            position: stop.position,
            slug: stop.slug,
            name: stop.name,
            editorial_summary: stop.editorial_summary,
          })),
        })
      : "";

  const handleDraftFieldChange = (
    field:
      | "title"
      | "subtitle"
      | "short_description"
      | "introduction"
      | "estimated_duration"
      | "seo_title"
      | "seo_description",
    value: string
  ) => {
    setEditableDraft((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleDraftStopSummaryChange = (stopIndex: number, value: string) => {
    setEditableDraft((prev) => {
      if (!prev) {
        return prev;
      }

      const nextStops = prev.stops.map((stop, index) =>
        index === stopIndex ? { ...stop, editorial_summary: value } : stop
      );

      return {
        ...prev,
        stops: nextStops,
      };
    });
  };

  const handleStartDraftEdit = () => {
    if (!selectedProposal?.editorialDraft) {
      return;
    }

    setDraftSaveState(initialDraftSaveState);
    setEditableDraft(toEditableDraftState(selectedProposal.editorialDraft));
    setIsEditingDraft(true);
    setShowPublishConfirmation(false);
  };

  const handleCancelDraftEdit = () => {
    if (!selectedProposal?.editorialDraft) {
      setEditableDraft(null);
      setIsEditingDraft(false);
      return;
    }

    setEditableDraft(toEditableDraftState(selectedProposal.editorialDraft));
    setIsEditingDraft(false);
    setDraftSaveState(initialDraftSaveState);
  };

  const handleSelectProposal = (proposal: StudioCircuitItem) => {
    setSelectedId(proposal.id);
    setIsEditingDraft(false);
    setShowPublishConfirmation(false);
    setDraftSaveState(initialDraftSaveState);
    setPublishState(initialPublishState);
    setEditableDraft(proposal.editorialDraft ? toEditableDraftState(proposal.editorialDraft) : null);
  };

  const handleSaveDraftSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startDraftSaveTransition(async () => {
      const result = await saveCircuitEditorialDraftAction(initialDraftSaveState, formData);
      setDraftSaveState(result);

      if (result.success) {
        setIsEditingDraft(false);
        router.refresh();
      }
    });
  };

  const handleOpenPublishConfirmation = () => {
    setPublishState(initialPublishState);
    setShowPublishConfirmation(true);
    setIsEditingDraft(false);
  };

  const handleCancelPublishConfirmation = () => {
    if (isPublishing) {
      return;
    }

    setShowPublishConfirmation(false);
  };

  const handlePublishSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startPublishTransition(async () => {
      const result = await publishCircuitProposalAction(initialPublishState, formData);
      setPublishState(result);

      if (result.success) {
        setShowPublishConfirmation(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <section className={styles.panel} aria-label="Métriques circuits">
        <h2 className={styles.panelTitle}>Métriques</h2>
        <div className={styles.metricGrid}>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Propositions</p>
            <p className={styles.metricValue}>{metrics.totalProposals}</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>En attente</p>
            <p className={styles.metricValue}>{metrics.pendingProposals}</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Approuvées</p>
            <p className={styles.metricValue}>{metrics.approvedProposals}</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Rejetées</p>
            <p className={styles.metricValue}>{metrics.rejectedProposals}</p>
          </article>
        </div>
        <p className={styles.circuitsSupportLine}>
          Circuits publiés détectés: <strong>{metrics.totalCircuits}</strong>
        </p>
      </section>

      <section className={styles.panel} aria-label="Propositions de circuits">
        <h2 className={styles.panelTitle}>Propositions de circuits</h2>

        {proposals.length === 0 ? (
          <p className={styles.emptyMessage}>
            Aucune proposition visible pour ce compte. Vérifiez les politiques RLS et le remplissage de
            <code> circuit_proposals</code>.
          </p>
        ) : (
          <div className={styles.circuitsWorkbench}>
            <div className={styles.circuitsList} role="list" aria-label="Liste des propositions">
              {proposals.map((proposal) => {
                const isActive = proposal.id === selectedProposal?.id;

                return (
                  <button
                    key={proposal.id}
                    type="button"
                    onClick={() => handleSelectProposal(proposal)}
                    className={`${styles.circuitsListItem} ${isActive ? styles.circuitsListItemActive : ""}`}
                    aria-pressed={isActive}
                  >
                    <div className={styles.circuitsItemTopRow}>
                      <p className={styles.circuitsItemTitle}>{proposal.destinationStrategique}</p>
                      <span className={`${styles.statusBadge} ${statusTone(proposal.status)}`}>
                        {formatStatus(proposal.status)}
                      </span>
                    </div>
                    <p className={styles.circuitsItemMeta}>
                      Circuit source : {proposal.sourceCircuitLabel ?? "Inconnu"}
                    </p>
                    <p className={styles.circuitsItemMeta}>
                      Pivot : {proposal.pivot ?? "-"}
                    </p>
                    <p className={styles.circuitsItemMeta}>{proposal.stopCount ?? proposal.stops.length} étapes</p>
                    <p className={styles.circuitsItemMeta}>
                      Score : {proposal.score !== null ? `${proposal.score} / 100` : "-"}
                    </p>
                    <p className={styles.circuitsItemMeta}>
                      Confiance : {formatConfidenceLevel(proposal.confidenceLevel)}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className={styles.circuitsDetailPanel} aria-live="polite">
              {selectedProposal ? (
                <>
                  <div className={styles.circuitsDetailHeader}>
                    <h3 className={styles.circuitsDetailTitle}>{selectedProposal.destinationStrategique}</h3>
                    <span className={`${styles.statusBadge} ${statusTone(selectedProposal.status)}`}>
                      {formatStatus(selectedProposal.status)}
                    </span>
                  </div>

                  <dl className={styles.circuitsDetailGrid}>
                    <div>
                      <dt>Destination stratégique</dt>
                      <dd>{selectedProposal.destinationStrategique}</dd>
                    </div>
                    <div>
                      <dt>Circuit source</dt>
                      <dd>{selectedProposal.sourceCircuitLabel ?? "Inconnu"}</dd>
                    </div>
                    <div>
                      <dt>Pivot</dt>
                      <dd>{selectedProposal.pivot ?? "-"}</dd>
                    </div>
                    <div>
                      <dt>Nombre d&apos;étapes</dt>
                      <dd>{selectedProposal.stopCount ?? selectedProposal.stops.length}</dd>
                    </div>
                    <div>
                      <dt>Score Brain</dt>
                      <dd>{selectedProposal.score !== null ? `${selectedProposal.score} / 100` : "-"}</dd>
                    </div>
                    <div>
                      <dt>Confiance</dt>
                      <dd>{formatConfidenceLevel(selectedProposal.confidenceLevel)}</dd>
                    </div>
                    <div>
                      <dt>Statut</dt>
                      <dd>{formatStatus(selectedProposal.status)}</dd>
                    </div>
                    <div>
                      <dt>Date de création</dt>
                      <dd>{formatDate(selectedProposal.createdAt)}</dd>
                    </div>
                  </dl>

                  <div className={styles.circuitsNarrativeBlock}>
                    <p className={styles.circuitsNarrativeTitle}>Circuit proposé</p>
                    <p className={styles.circuitsNarrativeValue}>{formatStops(selectedProposal.stops)}</p>
                  </div>

                  <div className={styles.circuitsNarrativeBlock}>
                    <p className={styles.circuitsNarrativeTitle}>Justifications du Brain</p>
                    {selectedProposal.findings.length > 0 ? (
                      <ul className={styles.findingsList}>
                        {selectedProposal.findings.map((finding, index) => (
                          <li key={`${finding}-${index}`}>✓ {finding}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.emptyMessage}>Aucune justification fournie.</p>
                    )}
                  </div>

                  <div
                    className={`${styles.circuitsNarrativeBlock} ${styles.circuitsNarrativeBlockEditorial}`}
                  >
                    <p
                      className={`${styles.circuitsNarrativeTitle} ${styles.circuitsNarrativeTitleEditorial}`}
                    >
                      Brouillon éditorial
                    </p>
                    {selectedProposal.editorialDraft ? (
                      <>
                        {canEditDraft && !isEditingDraft ? (
                          <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={handleStartDraftEdit}
                          >
                            Modifier le brouillon
                          </button>
                        ) : null}

                        {isEditingDraft && editableDraft ? (
                          <form onSubmit={handleSaveDraftSubmit} className={styles.editorialEditForm}>
                            <input type="hidden" name="proposalId" value={selectedProposal.id} />
                            <input type="hidden" name="draftPayload" value={draftPayload} />

                            <div className={styles.fieldGroup}>
                              <label htmlFor={`draft-title-${selectedProposal.id}`} className={styles.fieldLabel}>
                                Titre
                              </label>
                              <input
                                id={`draft-title-${selectedProposal.id}`}
                                className={styles.fieldInput}
                                value={editableDraft.title}
                                onChange={(event) => handleDraftFieldChange("title", event.target.value)}
                              />
                            </div>

                            <div className={styles.fieldGroup}>
                              <label htmlFor={`draft-subtitle-${selectedProposal.id}`} className={styles.fieldLabel}>
                                Sous-titre
                              </label>
                              <input
                                id={`draft-subtitle-${selectedProposal.id}`}
                                className={styles.fieldInput}
                                value={editableDraft.subtitle}
                                onChange={(event) => handleDraftFieldChange("subtitle", event.target.value)}
                              />
                            </div>

                            <div className={styles.fieldGroup}>
                              <label
                                htmlFor={`draft-short-description-${selectedProposal.id}`}
                                className={styles.fieldLabel}
                              >
                                Description courte
                              </label>
                              <textarea
                                id={`draft-short-description-${selectedProposal.id}`}
                                className={styles.textAreaInput}
                                value={editableDraft.short_description}
                                onChange={(event) =>
                                  handleDraftFieldChange("short_description", event.target.value)
                                }
                                rows={3}
                              />
                            </div>

                            <div className={styles.fieldGroup}>
                              <label
                                htmlFor={`draft-introduction-${selectedProposal.id}`}
                                className={styles.fieldLabel}
                              >
                                Introduction
                              </label>
                              <textarea
                                id={`draft-introduction-${selectedProposal.id}`}
                                className={styles.textAreaInput}
                                value={editableDraft.introduction}
                                onChange={(event) =>
                                  handleDraftFieldChange("introduction", event.target.value)
                                }
                                rows={5}
                              />
                            </div>

                            <div className={styles.fieldGroup}>
                              <label
                                htmlFor={`draft-estimated-duration-${selectedProposal.id}`}
                                className={styles.fieldLabel}
                              >
                                Durée estimée
                              </label>
                              <input
                                id={`draft-estimated-duration-${selectedProposal.id}`}
                                className={styles.fieldInput}
                                value={editableDraft.estimated_duration}
                                onChange={(event) =>
                                  handleDraftFieldChange("estimated_duration", event.target.value)
                                }
                              />
                            </div>

                            <div className={styles.editorialSubSection}>
                              <p className={styles.circuitsNarrativeTitle}>Étapes du circuit</p>
                              <ol className={styles.editorialStopsList}>
                                {editableDraft.stops.map((stop, stopIndex) => (
                                  <li key={`${stop.position}-${stop.slug}`} className={styles.editorialStopItem}>
                                    <p className={styles.editorialStopTitle}>
                                      {stop.position}. {stop.name}
                                    </p>
                                    <textarea
                                      className={styles.textAreaInput}
                                      value={stop.editorial_summary}
                                      onChange={(event) =>
                                        handleDraftStopSummaryChange(stopIndex, event.target.value)
                                      }
                                      rows={3}
                                    />
                                  </li>
                                ))}
                              </ol>
                            </div>

                            <div className={styles.editorialSubSection}>
                              <p className={styles.circuitsNarrativeTitle}>SEO</p>
                              <div className={styles.fieldGroup}>
                                <label
                                  htmlFor={`draft-seo-title-${selectedProposal.id}`}
                                  className={styles.fieldLabel}
                                >
                                  Titre SEO
                                </label>
                                <input
                                  id={`draft-seo-title-${selectedProposal.id}`}
                                  className={styles.fieldInput}
                                  value={editableDraft.seo_title}
                                  onChange={(event) =>
                                    handleDraftFieldChange("seo_title", event.target.value)
                                  }
                                />
                              </div>

                              <div className={styles.fieldGroup}>
                                <label
                                  htmlFor={`draft-seo-description-${selectedProposal.id}`}
                                  className={styles.fieldLabel}
                                >
                                  Description SEO
                                </label>
                                <textarea
                                  id={`draft-seo-description-${selectedProposal.id}`}
                                  className={styles.textAreaInput}
                                  value={editableDraft.seo_description}
                                  onChange={(event) =>
                                    handleDraftFieldChange("seo_description", event.target.value)
                                  }
                                  rows={3}
                                />
                              </div>
                            </div>

                            <DraftEditButtons onCancel={handleCancelDraftEdit} pending={isSavingDraft} />
                          </form>
                        ) : (
                          <>
                            <dl className={styles.editorialDetailGrid}>
                              <div>
                                <dt>Titre</dt>
                                <dd>{selectedProposal.editorialDraft.title}</dd>
                              </div>
                              <div>
                                <dt>Sous-titre</dt>
                                <dd>{selectedProposal.editorialDraft.subtitle}</dd>
                              </div>
                              <div>
                                <dt>Description courte</dt>
                                <dd>{selectedProposal.editorialDraft.short_description}</dd>
                              </div>
                              <div>
                                <dt>Introduction</dt>
                                <dd>{selectedProposal.editorialDraft.introduction}</dd>
                              </div>
                              <div>
                                <dt>Durée estimée</dt>
                                <dd>{selectedProposal.editorialDraft.estimated_duration}</dd>
                              </div>
                            </dl>

                            <div className={styles.editorialSubSection}>
                              <p className={styles.circuitsNarrativeTitle}>Étapes du circuit</p>
                              <ol className={styles.editorialStopsList}>
                                {formatDraftStops(selectedProposal.editorialDraft.stops).map((stop) => (
                                  <li key={`${stop.position}-${stop.slug}`} className={styles.editorialStopItem}>
                                    <p className={styles.editorialStopTitle}>
                                      {stop.position}. {stop.name}
                                    </p>
                                    <p className={styles.editorialStopSummary}>{stop.editorial_summary}</p>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            <div className={styles.editorialSubSection}>
                              <p className={styles.circuitsNarrativeTitle}>SEO</p>
                              <dl className={styles.editorialDetailGrid}>
                                <div>
                                  <dt>Titre SEO</dt>
                                  <dd>{selectedProposal.editorialDraft.seo_title}</dd>
                                </div>
                                <div>
                                  <dt>Description SEO</dt>
                                  <dd>{selectedProposal.editorialDraft.seo_description}</dd>
                                </div>
                              </dl>
                            </div>
                          </>
                        )}

                        {draftSaveState.error ? <p className={styles.authError}>{draftSaveState.error}</p> : null}
                        {draftSaveState.success ? <p className={styles.authInfo}>{draftSaveState.success}</p> : null}
                      </>
                    ) : (
                      <p className={styles.emptyMessage}>Brouillon éditorial non généré.</p>
                    )}
                  </div>

                  <div
                    className={`${styles.circuitsNarrativeBlock} ${
                      selectedProposal.status !== "proposed"
                        ? styles.circuitsNarrativeBlockDecisionDone
                        : ""
                    }`}
                  >
                    <p
                      className={`${styles.circuitsNarrativeTitle} ${
                        selectedProposal.status !== "proposed"
                          ? styles.circuitsNarrativeTitleDecisionDone
                          : ""
                      }`}
                    >
                      Décision
                    </p>
                    {selectedProposal.status === "proposed" ? (
                      <form action={decisionAction} className={styles.decisionForm}>
                        <input type="hidden" name="proposalId" value={selectedProposal.id} />
                        <DecisionButtons />
                      </form>
                    ) : (
                      <p className={styles.emptyMessage}>Cette proposition a déjà été traitée.</p>
                    )}

                    {decisionState.error ? <p className={styles.authError}>{decisionState.error}</p> : null}
                    {decisionState.success ? <p className={styles.authInfo}>{decisionState.success}</p> : null}
                  </div>

                  {selectedProposal.canPublish ? (
                    <div className={styles.circuitsNarrativeBlock}>
                      <p className={styles.circuitsNarrativeTitle}>Publication</p>

                      {!showPublishConfirmation ? (
                        <button
                          type="button"
                          className={styles.primaryButton}
                          onClick={handleOpenPublishConfirmation}
                          disabled={isPublishing}
                        >
                          Publier le circuit
                        </button>
                      ) : (
                        <form onSubmit={handlePublishSubmit} className={styles.publishConfirmForm}>
                          <input type="hidden" name="proposalId" value={selectedProposal.id} />
                          <input
                            type="hidden"
                            name="existingCircuitId"
                            value={selectedProposal.existingCircuitId ?? ""}
                          />

                          <p className={styles.emptyMessage}>
                            Cette action va publier le contenu validé sur le circuit existant et rendre
                            la proposition comme publiée. Continuer ?
                          </p>

                          <PublishConfirmButtons
                            pending={isPublishing}
                            onCancel={handleCancelPublishConfirmation}
                          />
                        </form>
                      )}

                      {publishState.error ? <p className={styles.authError}>{publishState.error}</p> : null}
                      {publishState.success ? <p className={styles.authInfo}>{publishState.success}</p> : null}
                    </div>
                  ) : null}

                  <details className={styles.rawJsonBlock}>
                    <summary>Informations techniques</summary>
                    <dl className={styles.technicalGrid}>
                      <div>
                        <dt>Proposition ID</dt>
                        <dd>{selectedProposal.id}</dd>
                      </div>
                      <div>
                        <dt>Circuit source ID</dt>
                        <dd>{selectedProposal.sourceCircuitId ?? "-"}</dd>
                      </div>
                      <div>
                        <dt>Mission ID</dt>
                        <dd>{selectedProposal.missionId ?? "-"}</dd>
                      </div>
                      <div>
                        <dt>Décision IA ID</dt>
                        <dd>{selectedProposal.decisionId ?? "-"}</dd>
                      </div>
                      <div>
                        <dt>Circuit lié ID</dt>
                        <dd>{selectedProposal.linkedCircuitId ?? "-"}</dd>
                      </div>
                      <div>
                        <dt>Circuit existant détecté</dt>
                        <dd>{selectedProposal.existingCircuitSlug ?? "-"}</dd>
                      </div>
                    </dl>
                  </details>
                </>
              ) : (
                <p className={styles.emptyMessage}>Sélectionnez une proposition pour voir le détail.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function DraftEditButtons({ onCancel, pending }: { onCancel: () => void; pending: boolean }) {

  return (
    <div className={styles.decisionButtonsRow}>
      <button type="submit" className={styles.primaryButton} disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
      <button
        type="button"
        className={styles.secondaryDangerButton}
        onClick={onCancel}
        disabled={pending}
      >
        Annuler
      </button>
    </div>
  );
}

function PublishConfirmButtons({
  onCancel,
  pending,
}: {
  onCancel: () => void;
  pending: boolean;
}) {
  return (
    <div className={styles.decisionButtonsRow}>
      <button type="button" className={styles.secondaryDangerButton} onClick={onCancel} disabled={pending}>
        Annuler
      </button>
      <button type="submit" className={styles.primaryButton} disabled={pending}>
        {pending ? "Publication..." : "Publier"}
      </button>
    </div>
  );
}
