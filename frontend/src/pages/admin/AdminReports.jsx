import { FileBarChart, Download, Calendar, Filter } from 'lucide-react';
import BackButton from '../../components/common/BackButton';

const AdminReports = () => {
  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <FileBarChart className="text-primary-500" /> System Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Generate and export system-wide analytics and compliance reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Report Generator Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">Generate Custom Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">Report Type</label>
                <select className="w-full px-4 py-2 bg-background border border-border rounded-lg">
                  <option>National Infrastructure Deficit</option>
                  <option>MP Responsiveness Index</option>
                  <option>AI Recommendation Accuracy</option>
                  <option>Citizen Engagement Metrics</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">State/Region Filter</label>
                <select className="w-full px-4 py-2 bg-background border border-border rounded-lg">
                  <option>All India</option>
                  <option>Maharashtra</option>
                  <option>Karnataka</option>
                  <option>Delhi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Start Date</label>
                <input type="date" className="w-full px-4 py-2 bg-background border border-border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">End Date</label>
                <input type="date" className="w-full px-4 py-2 bg-background border border-border rounded-lg" />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button className="px-4 py-2 bg-surface border border-border rounded-lg font-medium hover:bg-surfaceHover">
                Preview Data
              </button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2">
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-info" /> Scheduled Exports
            </h2>
            
            <div className="space-y-3">
              <div className="p-3 bg-surface border border-border rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold">Weekly Govt summary</h4>
                  <p className="text-xs text-gray-500">Every Monday at 08:00</p>
                </div>
                <span className="text-[10px] bg-success/10 text-success px-2 py-1 rounded font-bold uppercase">Active</span>
              </div>
              
              <div className="p-3 bg-surface border border-border rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold">Monthly AI Performance</h4>
                  <p className="text-xs text-gray-500">1st of Month at 00:00</p>
                </div>
                <span className="text-[10px] bg-success/10 text-success px-2 py-1 rounded font-bold uppercase">Active</span>
              </div>
            </div>
            
            <button className="w-full mt-4 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 hover:text-foreground hover:border-border transition-colors">
              + Add Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
