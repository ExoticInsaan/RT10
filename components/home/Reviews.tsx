"use client";

import { useState } from "react";
import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import SectionLabel from "@/components/ui/SectionLabel";
import { reviews } from "@/lib/design/homeContent";

const pages = [reviews.slice(0, 4), reviews.slice(2, 6)];

export default function Reviews() {
  const [reviewPage, setReviewPage] = useState(0);
  const activePage = reviewPage % pages.length;

  return (
    <section className={cn("reviews-section")} aria-labelledby="reviews-title">
      <div className={cn("container")}>
        <div className={cn("reviews-head")}>
          <div>
            <SectionLabel variant="content">Student reviews</SectionLabel>
            <h2 id="reviews-title">
              What students are saying
              <br />
              <em>about Toppershelf</em>
            </h2>
            <p>
              Student perspectives on using important questions and flashcards
              during exam preparation.
            </p>
          </div>
          <div className={cn("review-arrows")}>
            <Button
              variant="secondary"
              ariaLabel="Previous reviews"
              onClick={() => setReviewPage((activePage - 1 + pages.length) % pages.length)}
            >
              ←
            </Button>
            <Button
              variant="secondary"
              ariaLabel="Next reviews"
              onClick={() => setReviewPage((activePage + 1) % pages.length)}
            >
              →
            </Button>
          </div>
        </div>
        <div className={cn("review-grid")} aria-live="polite">
          {pages[activePage].map((review) => (
            <article className={cn("review-card")} key={`${activePage}-${review.name}`}>
              <div className={cn("review-person")}>
                <span className={cn(`avatar avatar-${review.tone}`)}>{review.initials}</span>
                <span>
                  <strong>{review.name}</strong>
                  <small>{review.course}</small>
                </span>
              </div>
              <div className={cn("review-stars")} aria-label="5 out of 5 stars">
                ★ ★ ★ ★ ★
              </div>
              <blockquote>“{review.quote}”</blockquote>
              <span className={cn("review-tag")}>{review.subject}</span>
            </article>
          ))}
        </div>
        <div className={cn("review-dots")} aria-label="Review pages">
          {pages.map((_, index) => (
            <Button
              key={index}
              variant="icon"
              className={cn(index === activePage ? "active" : "")}
              ariaLabel={`Show review page ${index + 1}`}
              onClick={() => setReviewPage(index)}
            >
              <span />
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
