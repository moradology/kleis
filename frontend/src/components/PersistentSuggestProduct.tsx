'use client';

import React, { useState } from 'react';
import SuggestProductCTA from './SuggestProductCTA';
import SuggestProductModal from './SuggestProductModal';

const PersistentSuggestProduct: React.FC = () => {
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  const handleOpenSuggestModal = () => setIsSuggestModalOpen(true);
  const handleCloseSuggestModal = () => setIsSuggestModalOpen(false);

  return (
    <div className="mt-12 mb-8"> {/* Add some margin around the CTA section */}
      <SuggestProductCTA onOpenModal={handleOpenSuggestModal} />
      <SuggestProductModal isOpen={isSuggestModalOpen} onClose={handleCloseSuggestModal} />
    </div>
  );
};

export default PersistentSuggestProduct;