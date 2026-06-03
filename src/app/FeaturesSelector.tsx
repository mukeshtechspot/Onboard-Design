import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface Feature {
  name: string;
}

interface FeaturesSelectorProps {
  selectedFeatures: string[];
  onChange: (features: string[]) => void;
}

export default function FeaturesSelector({ selectedFeatures, onChange }: FeaturesSelectorProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch('https://dev.abotribe.com/api/method/abo.api.utils.get_features');
        const data = await response.json();
        if (data?.message?.status === 'success' && data.message.features) {
          setFeatures(data.message.features);
        }
      } catch (error) {
        console.error('Error fetching features:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatures();
  }, []);

  const filteredFeatures = features.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredFeatures.length / itemsPerPage);
  const currentFeatures = filteredFeatures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const toggleFeature = (name: string) => {
    if (selectedFeatures.includes(name)) {
      onChange(selectedFeatures.filter(f => f !== name));
    } else {
      onChange([...selectedFeatures, name]);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border-2 border-slate-200 dark:border-zinc-700 rounded-xl leading-5 bg-white dark:bg-zinc-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 sm:text-sm transition-all text-slate-800 dark:text-slate-200"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-4 whitespace-nowrap">
          <span className="text-amber-500 dark:text-amber-400 text-base">{selectedFeatures.length}</span> selected
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 min-h-[160px] content-start">
            {currentFeatures.map((feature) => {
              const isSelected = selectedFeatures.includes(feature.name);
              return (
                <button
                  key={feature.name}
                  onClick={() => toggleFeature(feature.name)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 border border-amber-500'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 shadow-sm'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                  {feature.name}
                </button>
              );
            })}
            {currentFeatures.length === 0 && (
              <div className="w-full text-center py-8 text-slate-400 font-medium">
                No features found matching "{searchTerm}"
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredFeatures.length)} of {filteredFeatures.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
                <div className="flex items-center px-3 text-xs font-bold bg-slate-50 dark:bg-zinc-900 rounded-lg text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-zinc-800">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
