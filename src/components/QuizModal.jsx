"use client";

import { useState } from "react";

// Fire-and-forget anonymous aggregate stat only — never awaited, never
// blocks the UI, no per-user identity or answer history is sent or kept.
function recordAnswer(questionId, isCorrect) {
  fetch("/api/resources/quiz-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, isCorrect }),
  }).catch(() => {});
}

export default function QuizModal({ video, onClose }) {
  // Keyed by questionId -> the chosen choiceId. Once a question has an
  // entry here it's locked — this is a quick comprehension check, not a
  // graded test, so there's no submit button and no retry-until-right.
  const [answers, setAnswers] = useState({});

  const choose = (questionId, choice) => {
    if (answers[questionId]) return;
    setAnswers((prev) => ({ ...prev, [questionId]: choice.id }));
    recordAnswer(questionId, choice.isCorrect);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(20,30,42,0.55)] p-8 backdrop-blur-[3px] animate-[dm-pop_0.18s_ease]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-[640px] max-w-full overflow-y-auto rounded-[22px] bg-dm-panel shadow-[0_30px_80px_rgba(20,30,42,0.4)]"
      >
        <div className="flex items-start justify-between border-b border-dm-line px-[26px] py-[20px]">
          <div>
            <div className="mb-1 inline-flex items-center gap-[7px] rounded-full bg-dm-accent-soft px-3 py-[6px] text-xs font-bold text-dm-accent">
              <i className="fa-solid fa-circle-question" /> Fahanka — Check your understanding
            </div>
            <div className="mt-2 font-serif text-[22px] font-semibold leading-[1.25] text-dm-ink">
              {video.titleSo || video.titleEn}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-dm-bg text-[15px] text-dm-muted"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="flex flex-col gap-[26px] px-[26px] py-[24px]">
          {video.questions.map((q, qi) => {
            const selectedChoiceId = answers[q.id];
            const answered = Boolean(selectedChoiceId);

            return (
              <div key={q.id}>
                <div className="mb-3 text-[17px] font-semibold leading-[1.4] text-dm-ink">
                  {qi + 1}. {q.questionSo || q.questionEn}
                </div>
                {q.questionSo && q.questionEn && (
                  <div className="mb-3 text-[13px] leading-[1.4] text-dm-muted">{q.questionEn}</div>
                )}

                <div className="flex flex-col gap-[10px]">
                  {q.choices.map((choice) => {
                    const isSelected = selectedChoiceId === choice.id;
                    const showAsCorrect = answered && choice.isCorrect;
                    const showAsWrong = answered && isSelected && !choice.isCorrect;

                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => choose(q.id, choice)}
                        disabled={answered}
                        className={`flex items-center gap-[12px] rounded-[12px] border px-[16px] py-[12px] text-left transition-colors ${
                          showAsCorrect
                            ? "border-dm-accent bg-dm-accent-soft"
                            : showAsWrong
                              ? "border-[#c0504d] bg-[#fdecec]"
                              : "border-dm-line bg-dm-surface"
                        } ${answered ? "cursor-default" : "cursor-pointer hover:border-dm-accent"}`}
                      >
                        <span
                          className={`flex h-[20px] w-[20px] flex-none items-center justify-center rounded-full border-2 ${
                            showAsCorrect
                              ? "border-dm-accent bg-dm-accent text-white"
                              : showAsWrong
                                ? "border-[#c0504d] bg-[#c0504d] text-white"
                                : "border-dm-line"
                          }`}
                        >
                          {showAsCorrect && <i className="fa-solid fa-check text-[10px]" />}
                          {showAsWrong && <i className="fa-solid fa-xmark text-[10px]" />}
                        </span>
                        <span className="flex-1">
                          <span className="block text-[15px] leading-[1.4] text-dm-ink">
                            {choice.choiceSo || choice.choiceEn}
                          </span>
                          {choice.choiceSo && choice.choiceEn && (
                            <span className="block text-[12px] leading-[1.4] text-dm-muted">{choice.choiceEn}</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
