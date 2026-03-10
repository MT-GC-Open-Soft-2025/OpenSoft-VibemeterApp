import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvey } from '@/hooks/useSurvey';
import Swal from 'sweetalert2';
import AppShell from '@/components/AppShell/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const SCORE_LABELS = { 1: 'Strongly Disagree', 2: 'Disagree', 3: 'Neutral', 4: 'Agree', 5: 'Strongly Agree' };
const SCORE_COLORS = {
  1: { bg: '#fee2e2', border: '#fca5a5', text: '#dc2626' },
  2: { bg: '#fef3c7', border: '#fcd34d', text: '#d97706' },
  3: { bg: '#f1f5f9', border: '#cbd5e1', text: '#64748b' },
  4: { bg: '#d1fae5', border: '#6ee7b7', text: '#059669' },
  5: { bg: '#dcfce7', border: '#86efac', text: '#16a34a' },
};

const SurveyForm = () => {
  const navigate = useNavigate();
  const { questions, answers, status, errorMessage, setAnswer, submitSurvey } = useSurvey();

  const answered = Object.keys(answers).length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await submitSurvey();
    if (result.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Thank you!',
        text: 'Your feedback has been submitted.',
        confirmButtonColor: '#0f766e',
      }).then(() => navigate('/user'));
    }
  };

  if (status === 'loading') {
    return (
      <AppShell title="Wellbeing Survey" showBack>
        <div className="max-w-2xl mx-auto space-y-4 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Wellbeing Survey" showBack>
      <div className="max-w-2xl mx-auto pb-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)' }}>
            📝
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">We Value Your Feedback</h1>
          <p className="text-sm text-muted-foreground mt-2">Your thoughts help us improve WellBee for everyone.</p>
        </div>

        {/* Progress */}
        {total > 0 && (
          <div className="mb-6 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{answered} of {total} answered</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" indicatorClassName="bg-gradient-to-r from-teal-500 to-blue-600" />
          </div>
        )}

        {errorMessage && (
          <Alert variant="destructive" className="mb-5">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.map((q, idx) => {
            const selected = answers[q.question_id] ?? null;
            return (
              <Card key={q.question_id} className="shadow-sm border border-slate-200/80 transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center text-white"
                      style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)' }}>
                      {idx + 1}
                    </span>
                    <CardTitle className="text-sm font-semibold leading-snug text-foreground">{q.question_text}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label={q.question_text}>
                    {[1, 2, 3, 4, 5].map(score => {
                      const isSelected = selected === score;
                      const colors = SCORE_COLORS[score];
                      return (
                        <button
                          key={score}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setAnswer(q.question_id, score)}
                          className={cn(
                            'flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 text-sm font-bold transition-all duration-150 hover:scale-105',
                            isSelected
                              ? 'shadow-md scale-105'
                              : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                          )}
                          style={isSelected ? {
                            background: colors.bg,
                            borderColor: colors.border,
                            color: colors.text,
                          } : {}}
                          title={SCORE_LABELS[score]}
                        >
                          {score}
                          {isSelected && (
                            <span className="text-[9px] font-semibold mt-0.5 leading-none" style={{ color: colors.text }}>
                              {score === 1 ? 'Low' : score === 5 ? 'High' : ''}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    <div className="flex items-center ml-2 gap-4">
                      <span className="text-[10px] text-muted-foreground">← Disagree</span>
                      <span className="text-[10px] text-muted-foreground">Agree →</span>
                    </div>
                  </div>
                  {selected && (
                    <p className="text-xs font-medium mt-2 pl-0.5" style={{ color: SCORE_COLORS[selected].text }}>
                      ✓ {SCORE_LABELS[selected]}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <Button
            type="submit"
            className="w-full h-11 text-sm font-bold shadow-sm mt-2"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)' }}
            disabled={status === 'submitting' || questions.length === 0}
          >
            {status === 'submitting' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting…
              </span>
            ) : 'Submit Survey'}
          </Button>
        </form>
      </div>
    </AppShell>
  );
};

export default SurveyForm;
