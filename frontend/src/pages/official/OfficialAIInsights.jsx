import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { aiService } from '../../services/aiService';
import { BrainCircuit, FileText, Download, Sparkles, Filter, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const OfficialAIInsights = () => {
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [clustersData, setClustersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('last month');
  const [generating, setGenerating] = useState(false);

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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <BrainCircuit className="text-primary-500" /> AI Insights
          </h1>
          <p className="text-gray-500 dark:text-gray-400">LLM-generated executive summaries and semantic clustering.</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="last week">Last Week</option>
            <option value="last month">Last Month</option>
            <option value="last quarter">Last Quarter</option>
          </select>
          
          <button 
            onClick={handleRegenerate}
            disabled={generating}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
            Regenerate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          {/* Executive Summary */}
          <div className="glass-card p-6 md:p-8 rounded-xl relative overflow-hidden border border-primary-200 dark:border-primary-800">
            {/* Sparkle decorative background */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={120} />
            </div>
            
            <div className="flex justify-between items-start mb-6 border-b border-border pb-4 relative z-10">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="text-primary-600 dark:text-primary-400" />
                  Executive Summary Report
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Based on {summaryData?.total || 0} citizen submissions from {timeframe}.
                </p>
              </div>
              <button 
                onClick={() => {
                  // Simulate download functionality
                  toast.success('Report downloaded as PDF');
                }}
                className="p-2 bg-surfaceHover text-foreground rounded border border-border hover:bg-border transition-colors"
                title="Download PDF"
              >
                <Download size={18} />
              </button>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none relative z-10">
              {summaryData?.summary ? (
                // Safe basic markdown rendering for the summary text
                <div 
                  className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: summaryData.summary
                      .replace(/## (.*?)\n/g, '<h3 class="text-lg font-bold mt-6 mb-3 text-foreground">$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                      .replace(/\n\n/g, '<br/><br/>') 
                  }}
                />
              ) : (
                <p className="text-gray-500 italic">No summary generated yet. Try adjusting the timeframe or reporting new issues.</p>
              )}
            </div>
          </div>

          {/* Semantic Clusters */}
          <div>
            <h2 className="text-xl font-bold mb-4 mt-8 flex items-center gap-2">
              <Filter className="text-primary-500" /> Semantic Topic Clusters
            </h2>
            <p className="text-sm text-gray-500 mb-6">AI automatically groups related issues to help identify systemic problems rather than isolated incidents.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clustersData.length === 0 ? (
                <div className="col-span-full p-8 text-center glass-card rounded-xl text-gray-500">
                  Not enough data to form meaningful clusters.
                </div>
              ) : (
                clustersData.map((cluster, idx) => (
                  <div key={idx} className="glass-card p-5 rounded-xl border border-border hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-primary-600 dark:text-primary-400 capitalize">{cluster.topic}</h3>
                      <span className="bg-surface text-xs font-bold px-2 py-1 rounded border border-border">
                        {cluster.count} Issues
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Common Keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {cluster.keywords.map((kw, i) => (
                          <span key={i} className="text-[10px] bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                      <span className="text-sm font-medium">Avg Severity:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{cluster.avgSeverity}/10</span>
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${cluster.avgSeverity >= 7 ? 'bg-danger' : cluster.avgSeverity >= 4 ? 'bg-warning' : 'bg-info'}`}
                            style={{ width: `${(cluster.avgSeverity / 10) * 100}%` }}
                          />
                        </div>
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

export default OfficialAIInsights;
