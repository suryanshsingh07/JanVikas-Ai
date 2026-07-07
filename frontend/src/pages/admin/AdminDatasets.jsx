import { Database, Link2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import BackButton from '../../components/common/BackButton';

const AdminDatasets = () => {
  const datasets = [
    {
      id: 1,
      name: 'Pradhan Mantri Gram Sadak Yojana (PMGSY)',
      category: 'Road Infrastructure',
      status: 'synced',
      lastSync: '2 hours ago',
      records: '1.2M'
    },
    {
      id: 2,
      name: 'Jal Jeevan Mission',
      category: 'Water Supply',
      status: 'synced',
      lastSync: '5 hours ago',
      records: '450K'
    },
    {
      id: 3,
      name: 'Swachh Bharat Mission',
      category: 'Sanitation',
      status: 'error',
      lastSync: '2 days ago',
      records: '890K'
    }
  ];

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Database className="text-purple-500" /> Open Datasets
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Manage integrations with government data portals to cross-reference citizen demands.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
          <Link2 size={18} />
          Add Integration
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surfaceHover border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Dataset Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Records</th>
                <th className="px-4 py-3 font-medium">Last Sync</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {datasets.map(ds => (
                <tr key={ds.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-4 font-medium">{ds.name}</td>
                  <td className="px-4 py-4"><span className="px-2 py-1 bg-surface border border-border rounded text-xs">{ds.category}</span></td>
                  <td className="px-4 py-4 text-gray-500">{ds.records}</td>
                  <td className="px-4 py-4 text-gray-500">{ds.lastSync}</td>
                  <td className="px-4 py-4">
                    {ds.status === 'synced' ? (
                      <span className="flex items-center gap-1 text-success text-xs font-medium">
                        <CheckCircle2 size={14} /> Synced
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-danger text-xs font-medium">
                        <AlertCircle size={14} /> Sync Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-primary-500 hover:text-primary-600 flex items-center justify-end gap-1 text-xs font-medium w-full">
                      <RefreshCw size={14} /> Sync Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-info/10 border border-info/20 p-4 rounded-xl flex gap-3 text-info-700 dark:text-info-300">
        <AlertCircle className="shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">How Datasets Are Used</p>
          <p>The AI recommendation engine cross-references citizen demands with these government datasets to calculate the "Infrastructure Gap" metric. For example, if citizens demand water supply but JJM data shows 100% coverage in that area, the AI flags a potential data discrepancy or maintenance issue.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDatasets;
