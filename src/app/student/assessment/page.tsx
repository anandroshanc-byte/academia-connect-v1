"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Box, Button, Chip, Container, Divider, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReplayIcon from "@mui/icons-material/Replay";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type Question = { skill: string; prompt: string; options: string[]; answer: number; explanation: string };

const questionSets: Question[][] = [
  [
    { skill: "Research Methodology", prompt: "Which design is most appropriate for comparing outcomes between two intervention groups?", options: ["A randomized controlled trial", "A single-person case report", "An unsystematic expert opinion", "A retrospective editorial"], answer: 0, explanation: "Randomization reduces selection bias and makes outcome differences between intervention groups more interpretable." },
    { skill: "Pharmacognosy", prompt: "Which activity best supports identification of bioactive plant constituents?", options: ["Authentication followed by extraction and chromatography", "Changing the product label", "Skipping botanical identification", "Measuring only tablet color"], answer: 0, explanation: "Authenticated plant material, controlled extraction and chromatographic profiling create a defensible evidence trail." },
    { skill: "Clinical Research", prompt: "Which element is essential before enrolling participants in a clinical study?", options: ["Ethics approval and informed consent", "A marketing campaign", "A final publication", "An unblinded press release"], answer: 0, explanation: "Ethics review and informed consent protect participants and are foundational requirements before enrollment." },
    { skill: "Herbal Formulation", prompt: "Why is batch-to-batch standardization important in herbal products?", options: ["It improves consistency of quality and active-marker levels", "It removes the need for testing", "It guarantees every plant has identical chemistry", "It replaces stability studies"], answer: 0, explanation: "Standardization helps keep quality, safety and marker-compound levels consistent across production batches." },
  ],
  [
    { skill: "Research Methodology", prompt: "What is the main purpose of a preregistered study protocol?", options: ["To define methods and outcomes before results are known", "To guarantee a positive result", "To replace peer review", "To conceal the analysis plan"], answer: 0, explanation: "A preregistered protocol improves transparency by documenting methods and outcomes before analysis." },
    { skill: "Pharmacognosy", prompt: "What does a voucher specimen provide in medicinal plant research?", options: ["A traceable reference for the identified plant material", "A substitute for quality testing", "A patient consent form", "A clinical endpoint"], answer: 0, explanation: "A voucher specimen anchors the botanical identity of the material used in a study." },
    { skill: "Clinical Research", prompt: "Which measure describes how often a new event occurs in a population over time?", options: ["Incidence", "Prevalence only", "Specificity", "Blinding"], answer: 0, explanation: "Incidence counts new events over a defined period, while prevalence includes existing events." },
    { skill: "Herbal Formulation", prompt: "Which test is most directly related to how a formulation changes during storage?", options: ["Stability testing", "Logo review", "Recruitment screening", "Literature citation count"], answer: 0, explanation: "Stability testing evaluates whether quality and performance remain acceptable across storage conditions and time." },
  ],
];

function shuffled<T>(items: T[]): T[] { return [...items].sort(() => Math.random() - 0.5); }

export default function Assessment() {
  const [setNumber, setSetNumber] = useState(0);
  const [questions, setQuestions] = useState(() => questionSets[0].map((question) => ({ ...question, options: shuffled(question.options) })));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const question = questions[index];
  const score = useMemo(() => answers.reduce((total, answer, questionIndex) => total + (answer === questions[questionIndex].answer ? 1 : 0), 0), [answers, questions]);

  function choose(option: number) { if (!submitted) setSelected(option); }
  function submitAnswer() {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSubmitted(true);
  }
  function nextQuestion() {
    if (index === questions.length - 1) return;
    setIndex((current) => current + 1);
    setSelected(null);
    setSubmitted(false);
  }
  function retake() {
    const nextSet = (setNumber + 1) % questionSets.length;
    setSetNumber(nextSet);
    setQuestions(questionSets[nextSet].map((item) => ({ ...item, options: shuffled(item.options) })));
    setIndex(0);
    setAnswers([]);
    setSelected(null);
    setSubmitted(false);
  }

  if (answers.length === questions.length && submitted) return <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}><Paper sx={{ p: { xs: 3, md: 6 } }}><Stack spacing={2}><Chip label="ASSESSMENT COMPLETE" color="success" sx={{ alignSelf: "flex-start" }} /><Typography variant="h1">Your competency profile is updated.</Typography><Typography color="text.secondary">You scored {score} of {questions.length}. Each answer below was evaluated against a competency area and can guide your improvement plan.</Typography><LinearProgress variant="determinate" value={(score / questions.length) * 100} color={score >= 3 ? "success" : "warning"} sx={{ my: 1 }} /><Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}><Button component={Link} href="/student/capability" variant="contained">View capability</Button><Button component={Link} href="/student/improve" variant="outlined">View improvement plan</Button><Button onClick={retake} variant="text" startIcon={<ReplayIcon />}>Retake with fresh questions</Button></Stack></Stack></Paper></Container>;

  const progress = (index / questions.length) * 100;
  const correct = selected === question.answer;
  return <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}><Stack spacing={2}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="overline" color="primary">AYUSH SKILL ASSESSMENT</Typography><Typography variant="h2" sx={{ mt: 0.5 }}>Research readiness check</Typography></Box><Typography variant="body2" color="text.secondary">Question {index + 1} of {questions.length}</Typography></Stack><LinearProgress variant="determinate" value={progress} aria-label={`Assessment progress: ${index + 1} of ${questions.length}`} /><Paper sx={{ p: { xs: 2.5, md: 4 }, mt: 2 }}><Chip label={question.skill} color="info" size="small" /><Typography variant="h2" sx={{ mt: 2, fontSize: { xs: "1.5rem", md: "2rem" } }}>{question.prompt}</Typography><Stack spacing={1.25} sx={{ mt: 3 }}>{question.options.map((option, optionIndex) => { const isSelected = selected === optionIndex; const isCorrect = submitted && optionIndex === question.answer; const isWrong = submitted && isSelected && !isCorrect; return <Button key={option} onClick={() => choose(optionIndex)} variant={isSelected ? "contained" : "outlined"} color={isCorrect ? "success" : isWrong ? "error" : "primary"} disabled={submitted} fullWidth sx={{ justifyContent: "flex-start", textAlign: "left", py: 1.5, px: 2 }}>{option}</Button>; })}</Stack>{submitted && <Alert severity={correct ? "success" : "warning"} icon={<CheckCircleOutlineIcon />}>{correct ? "Correct. " : "Review this competency. "}{question.explanation}</Alert>}<Divider sx={{ my: 3 }} /><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="caption" color="text.secondary">Answers are recorded only when you submit this question.</Typography>{!submitted ? <Button variant="contained" onClick={submitAnswer} disabled={selected === null} endIcon={<ArrowForwardIcon />}>Submit answer</Button> : index === questions.length - 1 ? <Button variant="contained" onClick={() => setSubmitted(true)}>View results</Button> : <Button variant="contained" onClick={nextQuestion} endIcon={<ArrowForwardIcon />}>Next question</Button>}</Stack></Paper></Stack></Container>;
}
