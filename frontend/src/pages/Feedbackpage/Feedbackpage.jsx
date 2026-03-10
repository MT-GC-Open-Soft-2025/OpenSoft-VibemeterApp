import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Markdown from 'markdown-to-jsx';
import { getConversations, getConversationFeedback, getConversationSummary } from '@/api/admin';
import AppShell from '@/components/AppShell/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    setEmployeeId(localStorage.getItem('selectedEmployee') || '');
  }, []);

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    if (!employeeId) return;
    (async () => {
      try {
        const res = await getConversations(employeeId);
        if (!Array.isArray(res.ConvoID)) throw new Error('Invalid API response format');
        setConversations(res.ConvoID);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingConversations(false);
      }
    })();
  }, [employeeId]);

  const handleSelect = async (convId, index) => {
    setSelectedIndex(index);
    setSelectedFeedback(null);
    setSelectedSummary(null);
    setLoadingDetails(true);
    try {
      const [feedbackRes, summaryRes] = await Promise.all([
        getConversationFeedback(employeeId, convId),
        getConversationSummary(employeeId, convId),
      ]);
      setSelectedFeedback(feedbackRes['Feedback'] || feedbackRes['Feedback '] || 'No feedback available.');
      setSelectedSummary(summaryRes['Summary'] || summaryRes['Summary '] || 'No summary available.');
    } catch {
      setSelectedFeedback('Error fetching feedback.');
      setSelectedSummary('Error fetching summary.');
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <AppShell title={`Feedback — ${employeeId || '…'}`} showBack>
      <div className="max-w-6xl mx-auto pb-8">
        {loadingConversations ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <Skeleton className="h-80 rounded-2xl" />
            <div className="md:col-span-3 space-y-4">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

            {/* Conversation list */}
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="pb-2 pt-4 px-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Conversations</p>
                {employeeId && (
                  <Badge variant="outline" className="w-fit text-xs">{employeeId}</Badge>
                )}
              </CardHeader>
              <ScrollArea className="h-[calc(100vh-250px)] min-h-64">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No past conversations
                  </div>
                ) : (
                  <div className="p-2">
                    {conversations.map((conv, index) => (
                      <button
                        key={conv}
                        onClick={() => handleSelect(conv, index)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150 text-left',
                          selectedIndex === index
                            ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
                            : 'hover:bg-slate-50 text-slate-700'
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                          selectedIndex === index ? 'bg-white/20' : 'bg-slate-100'
                        )}>
                          <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16" className={selectedIndex === index ? 'text-white' : 'text-slate-400'}>
                            <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn('text-xs font-semibold truncate', selectedIndex === index ? 'text-white' : 'text-slate-800')}>
                            {conv}
                          </p>
                          <p className={cn('text-[11px]', selectedIndex === index ? 'text-white/70' : 'text-slate-400')}>
                            Chat Session
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>

            {/* Detail panel */}
            <div className="md:col-span-3">
              {selectedIndex === null ? (
                <Card className="shadow-sm h-full min-h-64 flex items-center justify-center">
                  <CardContent className="text-center py-16">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-2xl">💬</div>
                    <h3 className="text-base font-bold text-foreground mb-1">Select a Conversation</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Choose a conversation from the list to view its feedback and detailed summary.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-5">
                  {/* Feedback card */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2.5 text-base">
                        <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-sm">⭐</span>
                        Feedback Given
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingDetails ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      ) : !selectedFeedback || selectedFeedback === '0' ? (
                        <p className="text-sm text-muted-foreground italic">No feedback was provided for this conversation.</p>
                      ) : (
                        <blockquote className="border-l-4 border-amber-400 bg-amber-50/50 rounded-r-xl px-4 py-3">
                          <p className="text-sm text-slate-800 leading-relaxed">"{selectedFeedback}"</p>
                        </blockquote>
                      )}
                    </CardContent>
                  </Card>

                  {/* Summary card */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2.5 text-base">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm">📄</span>
                        Conversation Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingDetails ? (
                        <div className="space-y-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className={`h-4 ${i === 2 ? 'w-4/5' : 'w-full'}`} />
                          ))}
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none text-slate-700 [&_p]:leading-relaxed [&_li]:text-sm">
                          <Markdown>{selectedSummary || ''}</Markdown>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default FeedbackPage;
