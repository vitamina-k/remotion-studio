export type CaptionWord = {
  word: string;
  start: number; // seconds
  end: number;   // seconds
};

export type CaptionWindow = {
  visibleWords: CaptionWord[];
  windowStart: number;  // index into original transcript
  activeIndex: number;  // global index of active word (-1 if none)
  lastPassedIndex: number;
};

const WINDOW_SIZE = 5;

/**
 * Given a transcript and a current time (in seconds), returns the
 * sliding window of up to WINDOW_SIZE words to display, plus metadata
 * needed to style each word (active, past, future).
 */
export function getCaptionWindow(
  transcript: CaptionWord[],
  currentTime: number
): CaptionWindow {
  const activeIndex = transcript.findIndex(
    (w) => currentTime >= w.start && currentTime < w.end
  );

  const lastPassedIndex = transcript.reduce((acc, w, i) => {
    return currentTime >= w.start ? i : acc;
  }, -1);

  const pivotIndex = activeIndex !== -1 ? activeIndex : lastPassedIndex;

  const windowStart = Math.max(0, pivotIndex - Math.floor(WINDOW_SIZE / 2));
  const windowEnd = Math.min(transcript.length, windowStart + WINDOW_SIZE);
  const visibleWords = transcript.slice(windowStart, windowEnd);

  return { visibleWords, windowStart, activeIndex, lastPassedIndex };
}

/**
 * Returns the style state for a word at globalIndex within the window.
 */
export function getWordState(
  globalIndex: number,
  activeIndex: number,
  lastPassedIndex: number
): { isActive: boolean; isPast: boolean } {
  const isActive = globalIndex === activeIndex;
  const isPast =
    globalIndex < activeIndex ||
    (activeIndex === -1 && globalIndex <= lastPassedIndex);
  return { isActive, isPast };
}
