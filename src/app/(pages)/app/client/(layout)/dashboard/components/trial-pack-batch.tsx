import { Package } from 'lucide-react';
import React from 'react';

const TrialPackBatch = () => {
  return (
    <div className="bg-primary/10 flex items-center justify-center gap-1 rounded-full px-2 py-1">
      <Package className="text-primary h-4 w-4" size={48} strokeWidth={2.5} />
      <p className="text-primary text-sm font-semibold">Trial Pack</p>
    </div>
  );
};

export default TrialPackBatch;
