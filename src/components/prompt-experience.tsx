"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { promptResponsePreviews, type DailyPrompt } from "@/lib/daily-prompt";

export function PromptExperience({ prompt }: { prompt: DailyPrompt }) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!photo) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setPhoto(event.target.files?.[0] ?? null);
    setSubmitted(false);
  }

  return (
    <div className="prompt-experience">
      <section className="prompt-card prompt-focus-card">
        <div className="prompt-card-heading">
          <div>
            <p className="eyebrow">Today&apos;s prompt</p>
            <span className="pill soft">{prompt.category.replaceAll("-", " ")}</span>
          </div>
          <span className="prompt-arrival">Arrived at a surprise moment</span>
        </div>
        <h2>{prompt.question}</h2>
        <p className="prompt-optional">Participation is optional.</p>

        <label className="photo-picker">
          <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} />
          <span className="camera-icon" aria-hidden="true">📷</span>
          <strong>{photo ? "Choose a different photo" : "Take photo"}</strong>
          <small>A photo is required to participate</small>
        </label>

        {previewUrl ? <img className="prompt-photo-preview" src={previewUrl} alt="Selected response preview" /> : null}

        <label className="caption-field">
          <span>Caption <em>optional</em></span>
          <textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Add a caption..." rows={3} />
        </label>

        <button className="primary-action prompt-submit" type="button" disabled={!photo || submitted} onClick={() => setSubmitted(true)}>
          {submitted ? "Response shared" : "Share response"}
        </button>
      </section>

      {submitted ? (
        <section className="prompt-responses">
          <div className="section-header prompt-responses-heading">
            <div>
              <p className="eyebrow">After your response</p>
              <h2>How others answered</h2>
            </div>
            <span className="muted">23 people you follow</span>
          </div>
          <div className="response-grid">
            {promptResponsePreviews.map((response) => (
              <article key={response.userId} className="response-card">
                <div className="avatar">{response.displayName.slice(0, 2).toUpperCase()}</div>
                <div><strong>{response.displayName}</strong><p>{response.text}</p></div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="prompt-response-teaser panel">
          <p className="panel-label">Responses from your network</p>
          <h3>23 people you follow have answered.</h3>
          <p className="muted">Share your photo to see the responses.</p>
        </section>
      )}
    </div>
  );
}
