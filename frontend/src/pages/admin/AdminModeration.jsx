import { useState } from 'react';
import { ShieldAlert, Check, X, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Mock data for hackathon presentation since real moderation API isn't fully built
const mockFlaggedContent = [
  {
    _id: '1',
    type: 'submission',
    title: 'Water Crisis in Sector 5',
    content: 'This is the worst possible situation, the politicians are completely useless and corrupt [profanity]...',
    author: 'Citizen XYZ',
    reason: 'Profanity & Hate Speech',
    flaggedBy: 'AI Auto-Mod',
    date: new Date().toISOString(),
    severity: 'high'
  },
  {
    _id: '2',
    type: 'comment',
    title: 'Re: Road repair needed',
    content: 'Spam link to my business: http://spam-example.com',
    author: 'Spammer123',
    reason: 'Spam/Advertising',
    flaggedBy: 'User Report',
    date: new Date(Date.now() - 86400000).toISOString(),
    severity: 'medium'
  }
];

const AdminModeration = () => {
  const [content, setContent] = useState(mockFlaggedContent);
  const [loading, setLoading] = useState(false);

  const handleAction = (id, action) => {
    // In a real app, make API call here
    if (action === 'delete') {
      setContent(prev => prev.filter(c => c._id !== id));
    } else if (action === 'approve') {
      setContent(prev => prev.filter(c => c._id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <ShieldAlert className="text-danger" /> Content Moderation
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Review flagged content and user reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 rounded-xl border border-border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Reviews</h3>
          <p className="text-2xl font-bold text-foreground">{content.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Auto-Mod Removed (24h)</h3>
          <p className="text-2xl font-bold text-foreground">14</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Bans</h3>
          <p className="text-2xl font-bold text-danger">3</p>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {content.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShieldAlert size={48} className="mx-auto mb-4 text-success opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Queue is empty</h3>
            <p>No content requires moderation at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {content.map((item) => (
              <div key={item._id} className="p-6 hover:bg-surfaceHover transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      item.severity === 'high' ? 'bg-danger/10 text-danger border border-danger/20' : 
                      'bg-warning/10 text-warning border border-warning/20'
                    }`}>
                      {item.severity} severity
                    </span>
                    <span className="text-xs font-medium text-gray-500">Flagged by: {item.flaggedBy}</span>
                    <span className="text-xs font-medium text-danger bg-danger/5 px-2 py-0.5 rounded">
                      Reason: {item.reason}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <div className="bg-background border border-border p-4 rounded-lg mb-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                  "{item.content}"
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Author: <span className="font-medium text-foreground">{item.author}</span></p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(item._id, 'approve')}
                      className="px-3 py-1.5 bg-surface border border-border text-success hover:bg-success/10 rounded flex items-center gap-1 text-sm font-medium transition-colors"
                    >
                      <Check size={16} /> Ignore (Safe)
                    </button>
                    <button 
                      onClick={() => handleAction(item._id, 'delete')}
                      className="px-3 py-1.5 bg-danger text-white rounded flex items-center gap-1 text-sm font-medium hover:bg-danger/90 transition-colors"
                    >
                      <Trash2 size={16} /> Delete Content
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModeration;
