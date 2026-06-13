'use client';

import React, { useState } from 'react';
import { ProductGrid } from '@/components/shared/ProductGrid';
import { ProductCard } from '@/components/shared/ProductCard';
import { SearchBar, FilterBar } from '@/components/shared/SearchBar';
import { CategoryPill } from '@/components/shared/CategoryPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { PackageSearch } from 'lucide-react';
import { Product, ProductCategory } from '@/types';

interface ProductsClientPageProps {
  initialProducts: Product[];
}

/**
 * Client Component — handles search and filter interactivity.
 * Receives pre-fetched products from the Server Component parent.
 */
export function ProductsClientPage({ initialProducts }: ProductsClientPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'All'>('All');

  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Filter / Search bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-3xl border border-border mb-8">
        <SearchBar
          value={searchQuery}
          onSearch={setSearchQuery}
          className="max-w-full md:max-w-sm"
        />
        <div className="flex w-full md:w-auto overflow-x-auto gap-2 pb-2 md:pb-0 scrollbar-hide">
          <CategoryPill
            label="Semua"
            active={activeCategory === 'All'}
            onClick={() => setActiveCategory('All')}
          />
          {PRODUCT_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.id}
              label={cat.label}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>
        <div className="hidden lg:block">
          <FilterBar />
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <ProductGrid>
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </ProductGrid>
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="Produk tidak ditemukan"
          description="Kami tidak dapat menemukan produk yang sesuai dengan pencarian Anda. Coba ubah filter pencarian."
          className="mt-12"
        />
      )}
    </>
  );
}
