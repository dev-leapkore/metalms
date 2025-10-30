import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssignmentQuestion, QuestionType } from '@/types/course';
import { Plus, Trash2 } from 'lucide-react';

const questionSchema = z.object({
  question_text: z.string().min(1, 'Question text is required').max(500),
  question_type: z.enum(['mcq', 'true_false', 'short_answer', 'fill_blank']),
  options: z.array(z.string()).optional(),
  correct_answer: z.union([z.string(), z.number()]).optional(),
  points: z.number().min(1, 'Points must be at least 1').max(100),
  time_limit_seconds: z.number().min(10, 'Minimum 10 seconds').max(600, 'Maximum 10 minutes'),
  explanation: z.string().optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface AddAssignmentQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  orderNumber: number;
  onSubmit: (data: Partial<AssignmentQuestion>) => Promise<void>;
}

export function AddAssignmentQuestionDialog({ 
  open, 
  onOpenChange, 
  assignmentId, 
  orderNumber, 
  onSubmit 
}: AddAssignmentQuestionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<string[]>(['', '']);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      points: 10,
      time_limit_seconds: 60,
      question_type: 'mcq',
    },
  });

  const questionType = form.watch('question_type');

  const handleSubmit = async (data: QuestionFormData) => {
    setLoading(true);
    try {
      const questionData: Partial<AssignmentQuestion> = {
        assignment_id: assignmentId,
        question_text: data.question_text,
        question_type: data.question_type as QuestionType,
        correct_answer: data.correct_answer,
        points: data.points,
        time_limit_seconds: data.time_limit_seconds,
        explanation: data.explanation,
        order: orderNumber,
      };

      // Add options only for MCQ
      if (data.question_type === 'mcq') {
        questionData.options = options.filter(opt => opt.trim() !== '');
      }

      await onSubmit(questionData);
      form.reset();
      setOptions(['', '']);
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const formatTimeDisplay = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes} minutes`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Question {orderNumber}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True/False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                      <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="question_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your question..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MCQ Options */}
            {questionType === 'mcq' && (
              <div className="space-y-2">
                <FormLabel>Answer Options</FormLabel>
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addOption} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            )}

            <FormField
              control={form.control}
              name="correct_answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct Answer (Optional for Subjective)</FormLabel>
                  {questionType === 'mcq' && (
                    <Select onValueChange={field.onChange} value={String(field.value || '')}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.filter(opt => opt.trim() !== '').map((option, idx) => (
                          <SelectItem key={idx} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {questionType === 'true_false' && (
                    <Select onValueChange={field.onChange} value={String(field.value || '')}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {(questionType === 'short_answer' || questionType === 'fill_blank') && (
                    <FormControl>
                      <Input placeholder="Enter the correct answer (optional)" {...field} onChange={e => field.onChange(e.target.value)} value={field.value as string || ''} />
                    </FormControl>
                  )}
                  <FormDescription>
                    For short answer/essay questions, this is optional for manual grading
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_limit_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="60" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>
                      {formatTimeDisplay(field.value || 60)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explanation (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Explain why this is the correct answer..." 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    This will be shown to students after they complete the assignment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Question'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
