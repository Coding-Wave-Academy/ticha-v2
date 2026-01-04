export const calculateNextReview = (card, quality) => {
  let { repetition, ease_factor, interval } = card;

  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    repetition += 1;
    if (repetition === 1) interval = 1;
    else if (repetition === 2) interval = 6;
    else interval = Math.round(interval * ease_factor);

    ease_factor += (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (ease_factor < 1.3) ease_factor = 1.3;
  }

  const next_review = new Date();
  next_review.setDate(next_review.getDate() + interval);

  return { repetition, ease_factor, interval, next_review };
};
