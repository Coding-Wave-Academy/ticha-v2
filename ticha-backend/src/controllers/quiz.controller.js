export const gradeAnswer = async (req, res) => {
  const { selectedOption, question } = req.body;

  const isCorrect = selectedOption === question.correct_answer;

  let explanation;

  if (isCorrect) {
    explanation = question.explanation_correct;
  } else {
    explanation = question.explanation_wrong[selectedOption];
  }

  res.json({
    correct: isCorrect,
    explanation
  });
};
