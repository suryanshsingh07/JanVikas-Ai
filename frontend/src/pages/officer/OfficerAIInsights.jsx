import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { aiService } from '../../services/aiService';
import { BrainCircuit, FileText, Download, Sparkles, Filter, RefreshCw, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import BackButton from '../../components/common/BackButton';

const formatSummaryPieces = (text = '') => {
  const parts = [];
  let lastIndex = 0;
  const regex = /\*\*(.*?)\*\*/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    parts.push(<strong key={start} className="text-primary-600 dark:text-primary-400">{match[1]}</strong>);
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

const renderSummaryText = (summary = '') => {
  return summary
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const headerMatch = block.match(/^##\s+(.*)/);
      if (headerMatch) {
        return (
          <h3 key={index} className="text-lg font-bold mt-6 mb-3 text-foreground">
            {headerMatch[1]}
          </h3>
        );
      }
      return (
        <p key={index} className="text-sm leading-relaxed mb-4">
          {formatSummaryPieces(block)}
        </p>
      );
    });
};

const OfficerAIInsights = () => {
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [clustersData, setClustersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('last month');
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef(null);

  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];
  
  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    const toastId = toast.loading('Generating PDF report...');
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`JanVikas_AI_Insights_${timeframe.replace(' ', '_')}.pdf`);
      
      toast.success('PDF Downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('PDF Generation Error:', err);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };
  
  // Extract the inner summary object from the backend response
  // Since the backend might return either a string or a parsed JSON object for 'summary'
  let parsedSummary = null;
  let rawSummaryString = '';

  if (summaryData?.summary) {
    if (typeof summaryData.summary === 'object') {
      parsedSummary = summaryData.summary;
    } else {
      try {
        parsedSummary = JSON.parse(summaryData.summary);
      } catch (e) {
        rawSummaryString = summaryData.summary;
      }
    }
  }

  const totalSubmissions = parsedSummary?.stats?.total ?? summaryData?.total ?? 0;
  const summaryStats = parsedSummary?.stats;
  const topIssuesData = Array.isArray(parsedSummary?.topIssues)
    ? parsedSummary.topIssues.map((issue) => ({
        name: issue.category.charAt(0).toUpperCase() + issue.category.slice(1),
        value: issue.count,
        percentage: issue.percentage
      }))
    : [];

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const filters = { district: user?.district, state: user?.state };
      
      const [summaryRes, clustersRes] = await Promise.all([
        aiService.getSummary({ ...filters, timeframe }),
        aiService.getClusters({ state: user?.state, days: timeframe === 'last week' ? 7 : 30 })
      ]);
      
      setSummaryData(summaryRes);
      setClustersData(clustersRes.data);
    } catch (error) {
      toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [user, timeframe]);

  const handleRegenerate = async () => {
    setGenerating(true);
    await fetchInsights();
    setGenerating(false);
    toast.success('Executive Summary Regenerated');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <BackButton className="mb-6" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <BrainCircuit className="text-primary-600 dark:text-primary-400 w-8 h-8" /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-400">AI Insights</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">LLM-generated executive summaries and semantic clustering.</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 shadow-sm"
          >
            <option value="last week">Last Week</option>
            <option value="last month">Last Month</option>
            <option value="last quarter">Last Quarter</option>
          </select>
          
          <button 
            onClick={handleRegenerate}
            disabled={generating}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
            Regenerate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-32 flex justify-center"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          {/* Executive Summary */}
          <div ref={reportRef} className="glass-card p-6 md:p-8 rounded-2xl relative overflow-hidden border border-primary-200/50 dark:border-primary-800/50 shadow-sm">
            {/* Sparkle decorative background */}
            <div className="absolute top-0 right-0 p-4 opacity-5 text-primary-600" data-html2canvas-ignore>
              <Sparkles size={180} />
            </div>
            
            <div className="flex justify-between items-start mb-8 border-b border-border pb-6 relative z-10">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <FileText className="text-primary-600 dark:text-primary-400 w-6 h-6" />
                  Executive Summary Report
                </h2>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  Based on <span className="text-primary-600 dark:text-primary-400 font-bold">{totalSubmissions}</span> citizen submissions from {timeframe}.
                </p>
              </div>
              <button 
                onClick={handleDownloadPDF}
                className="p-2.5 bg-surface text-foreground rounded-lg border border-border hover:bg-surfaceHover transition-all shadow-sm flex items-center justify-center group"
                title="Download PDF"
                data-html2canvas-ignore
              >
                <Download size={18} className="group-hover:text-primary-600 transition-colors" />
              </button>
            </div>

            <div className="space-y-8 relative z-10">
              {parsedSummary?.headline && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 p-4 rounded-r-xl">
                  <p className="text-lg font-semibold text-primary-800 dark:text-primary-200">{parsedSummary.headline}</p>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[2fr_1.2fr]">
                <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">AI Analysis</h3>
                  {parsedSummary?.summary ? (
                    <div className="text-gray-700 dark:text-gray-300 text-[15px]">
                      {renderSummaryText(parsedSummary.summary)}
                    </div>
                  ) : rawSummaryString ? (
                    <div className="space-y-4 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                      {renderSummaryText(rawSummaryString)}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No summary generated yet. Try adjusting the timeframe or reporting new issues.</p>
                  )}
                </div>

                {Array.isArray(parsedSummary?.actionPoints) && parsedSummary.actionPoints.length > 0 && (
                  <div className="rounded-xl border border-border bg-gradient-to-br from-gray-50 to-white dark:from-surface dark:to-surface/80 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Recommended Actions</h3>
                    <ul className="space-y-4">
                      {parsedSummary.actionPoints.map((point, idx) => {
                        // Add nice icons to action points based on text
                        let Icon = ArrowRight;
                        let colorClass = "text-primary-500 bg-primary-100 dark:bg-primary-900/30";
                        
                        if (point.toLowerCase().includes('urgent') || point.toLowerCase().includes('prioritize') || point.includes('🚨')) {
                           colorClass = "text-red-500 bg-red-100 dark:bg-red-900/30";
                        } else if (point.toLowerCase().includes('rate') || point.includes('📋')) {
                           colorClass = "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
                        } else if (point.toLowerCase().includes('good') || point.toLowerCase().includes('resolved')) {
                           colorClass = "text-green-500 bg-green-100 dark:bg-green-900/30";
                        }

                        // remove the emojis if present to clean up the UI since we have styling now
                        const cleanPoint = point.replace(/🚨|📋|✅|⚠️|ℹ️/g, '').trim();

                        return (
                          <li key={idx} className="flex items-start gap-3">
                            <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${colorClass}`}>
                              <span className="text-[10px] font-bold">{idx + 1}</span>
                            </div>
                            <span className="text-[15px] font-medium text-gray-800 dark:text-gray-200">{cleanPoint}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {summaryStats && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 pt-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 shadow-sm relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                        <FileText size={80} />
                      </div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-blue-100 relative z-10">Total Reports</p>
                      <p className="mt-2 text-3xl font-bold relative z-10">{summaryStats.total}</p>
                    </div>
                    
                    <div className="rounded-xl bg-surface border border-border p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Resolved</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-3xl font-bold text-foreground">{summaryStats.resolved}</p>
                        <p className="text-sm font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Completed</p>
                      </div>
                    </div>
                    
                    <div className="rounded-xl bg-surface border border-border p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Resolution Rate</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-3xl font-bold text-foreground">{summaryStats.resolutionRate}%</p>
                        <div className="flex-1 ml-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500" style={{width: `${summaryStats.resolutionRate}%`}}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-xl bg-surface border border-border p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Critical Issues</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <p className={`text-3xl font-bold ${summaryStats.critical > 0 ? 'text-red-500' : 'text-foreground'}`}>{summaryStats.critical}</p>
                        {summaryStats.critical > 0 && (
                           <p className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">Requires Attention</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2 mt-2">
                    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Top Issue Distribution</h3>
                        <span className="text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2.5 py-1 rounded-full">
                          {topIssuesData.length} categories
                        </span>
                      </div>
                      
                      {topIssuesData.length > 0 ? (
                        <div className="h-[280px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topIssuesData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                              <XAxis type="number" stroke="var(--foreground)" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis dataKey="name" type="category" stroke="var(--foreground)" fontSize={12} tickLine={false} axisLine={false} width={100} />
                              <RechartsTooltip 
                                cursor={{fill: 'var(--surface-hover)'}}
                                contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              />
                              <Bar dataKey="value" name="Submissions" radius={[0, 4, 4, 0]}>
                                {topIssuesData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[280px] flex items-center justify-center">
                           <p className="text-sm text-gray-500">No category breakdown available yet.</p>
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Category Breakdown</h3>
                      </div>
                      
                      {topIssuesData.length > 0 ? (
                        <div className="space-y-5">
                          {topIssuesData.map((issue, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="font-medium text-[15px]">{issue.name}</span>
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                  {issue.value} <span className="text-gray-400 font-normal">({issue.percentage}%)</span>
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div 
                                  className="h-full rounded-full" 
                                  style={{ 
                                    width: `${issue.percentage}%`,
                                    backgroundColor: CHART_COLORS[idx % CHART_COLORS.length]
                                  }} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                         <div className="h-full flex items-center justify-center">
                           <p className="text-sm text-gray-500">No issues to display.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Semantic Clusters */}
          <div>
            <h2 className="text-2xl font-bold mb-3 mt-12 flex items-center gap-3">
              <Filter className="text-primary-600 dark:text-primary-400 w-6 h-6" /> Semantic Topic Clusters
            </h2>
            <p className="text-gray-500 mb-8 font-medium">AI automatically groups related issues to help identify systemic problems rather than isolated incidents.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {!Array.isArray(clustersData) || clustersData.length === 0 ? (
                <div className="col-span-full p-12 text-center glass-card rounded-xl text-gray-500 border border-dashed border-gray-300 dark:border-gray-700">
                  <Filter className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="font-medium text-lg">Not enough data</p>
                  <p className="text-sm mt-1">We need more active submissions to form meaningful AI clusters.</p>
                </div>
              ) : (
                clustersData.map((cluster, idx) => (
                  <div key={idx} className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all flex flex-col h-full group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-foreground capitalize leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{cluster.topic}</h3>
                      <span className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ml-3">
                        {cluster.count} Issues
                      </span>
                    </div>
                    
                    <div className="mb-6 flex-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Key Terminology</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(cluster.keywords) ? cluster.keywords.map((kw, i) => (
                          <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md font-medium border border-gray-200 dark:border-gray-700">
                            {kw}
                          </span>
                        )) : (
                          <span className="text-xs text-gray-500 italic">No keywords available</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Severity</span>
                        <span className="text-sm font-bold text-foreground">{cluster.avgSeverity}/10</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${cluster.avgSeverity >= 7 ? 'bg-red-500' : cluster.avgSeverity >= 4 ? 'bg-orange-500' : 'bg-blue-500'}`}
                          style={{ width: `${(cluster.avgSeverity / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OfficerAIInsights;
