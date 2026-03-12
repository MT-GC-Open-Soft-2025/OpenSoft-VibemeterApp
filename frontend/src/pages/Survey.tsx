import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SURVEY_QUESTIONS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

const LIKERT_OPTIONS = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

const Survey = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  const progress = ((currentStep + 1) / SURVEY_QUESTIONS.length) * 100;
  const canGoNext = answers[currentStep] !== undefined;
  const isLast = currentStep === SURVEY_QUESTIONS.length - 1;

  const handleSubmit = () => {
    toast.success("Survey submitted! Thank you for your feedback. 🎉");
    setShowConfirm(false);
    navigate("/dashboard");
  };

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Question {currentStep + 1} of {SURVEY_QUESTIONS.length}</span>
              <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              {SURVEY_QUESTIONS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= currentStep ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </div>

          {/* Question */}
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-heading leading-relaxed">
                  {SURVEY_QUESTIONS[currentStep]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {LIKERT_OPTIONS.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAnswers({ ...answers, [currentStep]: idx })}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        answers[currentStep] === idx
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border hover:border-primary/30 hover:bg-accent/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[currentStep] === idx ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}>
                          {answers[currentStep] === idx && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            {isLast ? (
              <Button onClick={() => setShowConfirm(true)} disabled={!canGoNext}>
                Submit Survey <Check className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canGoNext}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Submit Survey?</DialogTitle>
            <DialogDescription>Your responses will be recorded. You can't change them after submission.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {SURVEY_QUESTIONS.map((q, i) => (
              <div key={i} className="flex justify-between items-center text-sm p-2 rounded-lg bg-muted/50">
                <span className="truncate max-w-[60%]">{q}</span>
                <span className="font-medium text-primary">{LIKERT_OPTIONS[answers[i]] || "—"}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Go Back</Button>
            <Button onClick={handleSubmit}>Confirm & Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Survey;
