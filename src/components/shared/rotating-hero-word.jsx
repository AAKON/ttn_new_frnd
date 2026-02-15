"use client";

import { useState, useEffect, useRef } from "react";

const DEFAULT_WORDS = ["Apparel", "Textile", "Fabric", "Clothing"];

const TYPING_SPEED_MS = 90;
const PAUSE_AFTER_WORD_MS = 2200;

export default function RotatingHeroWord({ words = DEFAULT_WORDS, className = "" }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const timeoutRef = useRef(null);

  const wordList = Array.isArray(words) && words.length > 0 ? words : DEFAULT_WORDS;
  const word = wordList[wordIndex];
  const displayText = word.slice(0, charIndex);

  useEffect(() => {
    if (charIndex < word.length) {
      timeoutRef.current = setTimeout(() => setCharIndex((c) => c + 1), TYPING_SPEED_MS);
    } else {
      timeoutRef.current = setTimeout(() => {
        setWordIndex((i) => (i + 1) % wordList.length);
        setCharIndex(0);
      }, PAUSE_AFTER_WORD_MS);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [wordIndex, charIndex, word.length, wordList.length]);

  return (
    <span className={`inline-block text-brand-600 ${className}`}>
      {displayText}
      <span className="animate-blink-cursor ml-0.5" aria-hidden>
        |
      </span>
    </span>
  );
}
