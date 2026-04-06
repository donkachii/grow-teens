/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
import { FiPlus, FiRefreshCw, FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/Button";
import requestClient from "@/lib/requestClient";
import { NextAuthUserSession } from "@/types";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  tags?: string;
  difficultyLevel: number;
  timesReviewed: number;
  lastReviewed?: Date;
  userId: number;
  programId?: number;
  moduleId?: number;
}

export default function FlashcardStudyPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const params = useParams();

  const moduleId = Number(params.moduleId);

  const session = useSession();
  const sessionData = session.data as NextAuthUserSession;

  const loadFlashcards = useCallback(() => {
    if (!sessionData?.user?.token) return;

    startTransition(async () => {
      try {
        setLoading(true);
        const response = await requestClient({
          token: sessionData?.user?.token,
        }).get(`/flashcards?moduleId=${moduleId}`);

        if (response.data) {
          setFlashcards(response.data.data || []);
          setCurrentIndex(0);
          setShowAnswer(false);
        }
      } catch (error) {
        console.error("Error loading flashcards:", error);
        toast.error("Error loading flashcards");
      } finally {
        setLoading(false);
      }
    });
  }, [moduleId, sessionData?.user?.token]);

  const generateFlashcards = useCallback(() => {
    if (!sessionData?.user?.token) return;

    startTransition(async () => {
      try {
        setLoading(true);
        const response = await requestClient({
          token: sessionData?.user?.token,
        }).post("/flashcards/generate", { moduleId, count: 5 });

        if (response.data) {
          toast.success("Flashcards generated successfully!");
          loadFlashcards();
        }
      } catch (error) {
        console.error("Failed to generate flashcards:", error);
        toast.error("Failed to generate flashcards");
      } finally {
        setLoading(false);
      }
    });
  }, [moduleId, sessionData?.user?.token, loadFlashcards]);

  const recordInteraction = useCallback(
    (flashcardId: number, correct: boolean) => {
      if (!sessionData?.user?.token) return;

      startTransition(async () => {
        try {
          await requestClient({
            token: sessionData?.user?.token,
          }).post(`/flashcards/${flashcardId}/interaction`, {
            correct,
            responseTime: Math.floor(Math.random() * 10) + 2,
          });
        } catch (error) {
          console.error("Error recording interaction:", error);
        }
      });
    },
    [sessionData?.user?.token]
  );

  const handleAnswer = useCallback(
    (correct: boolean) => {
      const card = flashcards[currentIndex];
      recordInteraction(card.id, correct);

      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        toast.success("You completed all flashcards! Great job studying this module.");
      }
    },
    [currentIndex, flashcards, recordInteraction]
  );

  useEffect(() => {
    if (sessionData?.user) {
      loadFlashcards();
    }
  }, [loadFlashcards, sessionData]);

  if (loading || isPending) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary" />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            No Flashcards Available
          </h1>
          <p className="text-gray-600">
            This module doesn&apos;t have any flashcards yet.
          </p>
          <Button onClick={generateFlashcards} size="lg" disabled={isPending}>
            <FiPlus />
            Generate Flashcards with AI
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Flashcard Study</h1>
        <Button variant="outline" onClick={loadFlashcards} disabled={isPending}>
          <FiRefreshCw />
          Refresh
        </Button>
      </div>

      <div className="mb-8 h-3 overflow-hidden rounded-md bg-gray-200">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${(currentIndex / flashcards.length) * 100}%` }}
        />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-gray-700">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
        <Button
          size="sm"
          variant="ghost"
          onClick={generateFlashcards}
          disabled={isPending}
        >
          Generate More
        </Button>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-8 shadow-lg">
        <div className="min-h-[200px]">
          {!showAnswer ? (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-500">
                Question
              </h2>
              <p className="text-xl text-gray-900">{currentCard.question}</p>
            </div>
          ) : (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-500">
                Answer
              </h2>
              <p className="text-xl text-gray-900">{currentCard.answer}</p>
            </div>
          )}
        </div>

        {currentCard.tags && (
          <div className="mt-4 flex flex-wrap gap-2">
            {currentCard.tags.split(",").map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {!showAnswer ? (
        <Button fullWidth size="lg" onClick={() => setShowAnswer(true)}>
          Show Answer
        </Button>
      ) : (
        <div className="flex gap-4">
          <button
            type="button"
            aria-label="Didn't know"
            onClick={() => handleAnswer(false)}
            disabled={isPending}
            className="flex flex-1 items-center justify-center rounded-md bg-error-500 px-6 py-4 text-white transition hover:bg-error-600 disabled:opacity-50"
          >
            <FiThumbsDown className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Got it right"
            onClick={() => handleAnswer(true)}
            disabled={isPending}
            className="flex flex-1 items-center justify-center rounded-md bg-success-600 px-6 py-4 text-white transition hover:bg-success-700 disabled:opacity-50"
          >
            <FiThumbsUp className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
