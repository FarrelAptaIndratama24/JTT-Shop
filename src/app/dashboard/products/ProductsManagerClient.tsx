'use client';

import React, { useState, useTransition, useRef, useEffect } from 'react';
import { Product, ProductCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { 
  createProductAction, 
  updateProductAction, 
  deleteProductAction,
  uploadProductImageAction,
} from '@/lib/actions/productActions';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Package, 
  ArrowLeft,
  Loader2,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { formatIDR } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

interface ProductsManagerClientProps {
  initialProducts: Product[];
  categories: { id: string; name: string }[];
  isAdmin: boolean;
  currentUserId: string;
  userWhatsapp?: string | null;
}

import { useRouter } from 'next/navigation';

export function ProductsManagerClient({ initialProducts, categories, isAdmin, currentUserId, userWhatsapp }: ProductsManagerClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // ─── KEY FIX: Sync server data into client state ───────────────────────────
  // useState only uses initialProducts on first mount. When router.refresh()
  // triggers a server re-render with fresh data, this effect picks up the
  // new initialProducts and updates local state so the UI reflects changes.
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  
  // Specs form states
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [tip, setTip] = useState('');
  const [joint, setJoint] = useState('');
  const [shaft, setShaft] = useState('');
  
  const [features, setFeatures] = useState('');

  // Image upload states
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle open modal for create
  const handleOpenCreate = () => {
    if (!userWhatsapp) {
      setShowWhatsappModal(true);
      return;
    }

    setModalMode('create');
    setSelectedProduct(null);
    setName('');
    setPrice('');
    setStock('');
    setBrand('');
    setCategoryName(categories[0]?.name || 'Carbon');
    setImageUrl('');
    setDescription('');
    setWeight('');
    setLength('');
    setTip('');
    setJoint('');
    setShaft('');
    setFeatures('');
    setImagePreview(null);
    setModalOpen(true);
  };

  // Handle open modal for edit
  const handleOpenEdit = (product: Product) => {
    // Only allow editing own products (unless admin)
    if (!isAdmin && product.seller_id !== currentUserId) {
      toast.error('You can only edit your own products.');
      return;
    }

    setModalMode('edit');
    setSelectedProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setBrand(product.name.split(' ')[0] || '');
    setCategoryName(product.category);
    setImageUrl(product.image);
    setDescription(product.description || '');
    
    // Specs
    setWeight(product.specs.weight || '');
    setLength(product.specs.length || '');
    setTip(product.specs.tip || '');
    setJoint(product.specs.joint || '');
    setShaft(product.specs.shaft || '');
    
    // Features
    setFeatures(product.features ? product.features.join(', ') : '');
    setImagePreview(product.image || null);
    setModalOpen(true);
  };

  // Handle image file selection
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadProductImageAction(formData);
      
      if (result.success && result.data?.url) {
        setImageUrl(result.data.url);
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(result.error || 'Failed to upload image.');
        setImagePreview(null);
      }
    } catch {
      toast.error('Image upload failed.');
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error('Product name is required.');
    if (name.trim().length < 3) return toast.error('Product name must be at least 3 characters.');
    if (!description.trim()) return toast.error('Description is required.');
    if (description.trim().length < 10) return toast.error('Description must be at least 10 characters.');
    if (!price || Number(price) <= 0) return toast.error('Please enter a valid price.');
    if (stock === '' || Number(stock) < 0) return toast.error('Stock cannot be negative.');
    if (!brand.trim()) return toast.error('Brand is required.');
    if (!imageUrl.trim()) return toast.error('Product image is required. Please upload an image.');

    // Look up category_id matching categoryName
    const categoryId = categories.find(c => c.name === categoryName)?.id || categories[0]?.id || 'cat-1';

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('brand', brand || name.split(' ')[0]);
    formData.append('category_id', categoryId);
    formData.append('image_url', imageUrl);
    formData.append('description', description);
    formData.append('weight', weight);
    formData.append('length', length);
    formData.append('tip', tip);
    formData.append('joint', joint);
    formData.append('shaft', shaft);
    formData.append('features', features);

    startTransition(async () => {
      let result;
      if (modalMode === 'create') {
        result = await createProductAction(formData);
      } else {
        result = await updateProductAction(selectedProduct!.id, formData);
      }

      if (result.success) {
        toast.success(modalMode === 'create' ? 'Product created!' : 'Product updated!');
        setModalOpen(false);

        // ─── Optimistic local state update for instant UI feedback ──────
        if (modalMode === 'edit' && selectedProduct) {
          const featuresList = features.split(',').map(f => f.trim()).filter(f => f !== '');
          const validCategories: ProductCategory[] = ['Carbon', 'Wood', 'Break', 'Jump', 'Shaft', 'Accessories'];
          const safeCategory: ProductCategory = validCategories.includes(categoryName as ProductCategory)
            ? (categoryName as ProductCategory)
            : selectedProduct.category;
          setProducts(prev => prev.map(p =>
            p.id === selectedProduct.id
              ? {
                  ...p,
                  name,
                  price: Number(price),
                  stock: Number(stock),
                  image: imageUrl,
                  description,
                  category: safeCategory,
                  specs: { weight, length, tip, joint, shaft },
                  features: featuresList,
                }
              : p
          ));
        }

        // Also trigger server re-fetch so state is fully in sync
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to save product.');
      }
    });
  };

  // Handle Delete
  const handleDelete = (id: string, name: string, sellerId?: string) => {
    // Client-side guard (server also verifies)
    if (!isAdmin && sellerId !== currentUserId) {
      toast.error('You can only delete your own products.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (result.success) {
        toast.success('Product deleted successfully.');
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        toast.error(result.error || 'Failed to delete product.');
      }
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors mb-3">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <SectionTitle
            title={isAdmin ? 'All Products (Admin)' : 'My Products'}
            subtitle={isAdmin 
              ? 'Manage all marketplace products. You have full moderation access.' 
              : 'Manage your product listings, pricing, stock, and images.'}
          />
        </div>
        <Button onClick={handleOpenCreate} className="rounded-full shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-5 w-5" />
          Add Product
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md mb-8">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="Search products..."
          className="pl-10 h-12 rounded-2xl bg-card border-border shadow-sm w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Inventory Table */}
      {filteredProducts.length > 0 ? (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
                  <th className="p-4 pl-6">Product</th>
                  <th className="p-4">Category</th>
                  {isAdmin && <th className="p-4">Seller</th>}
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProducts.map((product) => {
                  const isOwner = product.seller_id === currentUserId;
                  const canModify = isAdmin || isOwner;

                  return (
                    <tr key={product.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 pl-6 font-bold flex items-center gap-3">
                        <div className="relative h-10 w-12 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                          <img src={product.image} alt={product.name} className="object-cover h-full w-full" />
                        </div>
                        <span className="truncate max-w-[200px]">{product.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          {product.category}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="p-4">
                          <span className="text-xs text-muted-foreground">
                            {product.seller_name || 'Unknown'}
                          </span>
                        </td>
                      )}
                      <td className="p-4 font-semibold text-foreground">{formatIDR(product.price)}</td>
                      <td className="p-4 font-medium text-muted-foreground">
                        {product.stock > 0 ? (
                          <span className="text-green-500">{product.stock} units</span>
                        ) : (
                          <span className="text-red-400 font-bold">Out of stock</span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex justify-end gap-2 relative z-20">
                          {canModify && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleOpenEdit(product)}
                                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(product.id, product.name, product.seller_id)}
                                className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-400 text-muted-foreground"
                                disabled={isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-card/50 rounded-3xl border border-border border-dashed">
          <Package className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'No products found matching your search.' : 'No products uploaded yet'}
          </p>
          {!searchQuery && (
            <Button onClick={handleOpenCreate} variant="outline" className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Upload your first product
            </Button>
          )}
        </div>
      )}

      {/* CRUD Edit/Create Overlay Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !isPending && setModalOpen(false)}
        title={modalMode === 'create' ? 'Add New Product' : `Edit ${selectedProduct?.name}`}
        description="Fill in product details, specifications, features, and imagery."
        className="max-w-3xl"
      >
        <form id="product-form" onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Main info row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Product Name</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Predator REVO P3"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Category</label>
              <select
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                disabled={isPending}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                {/* Fallbacks */}
                <option value="Carbon">Carbon</option>
                <option value="Wood">Wood</option>
                <option value="Break">Break</option>
                <option value="Jump">Jump</option>
                <option value="Shaft">Shaft</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Price (IDR)</label>
              <Input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="12500000"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Stock Quantity</label>
              <Input
                type="number"
                value={stock}
                onChange={e => setStock(e.target.value)}
                placeholder="10"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Brand / Manufacturer</label>
              <Input
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="Predator"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold">Product Image</label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="relative h-24 w-24 rounded-xl bg-muted border-2 border-dashed border-border overflow-hidden shrink-0 flex items-center justify-center">
                {imagePreview || imageUrl ? (
                  <>
                    <img 
                      src={imagePreview || imageUrl} 
                      alt="Preview" 
                      className="object-cover h-full w-full" 
                    />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setImageUrl(''); }}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 hover:bg-black/80 transition-colors"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isPending || isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending || isUploading}
                  className="rounded-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP or GIF. Max 5MB.</p>

                {/* Fallback: manual URL */}
                <Input
                  value={imageUrl}
                  onChange={e => { setImageUrl(e.target.value); setImagePreview(e.target.value); }}
                  placeholder="Or paste image URL..."
                  disabled={isPending}
                  className="text-xs h-9"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold">Description</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Write a compelling overview of this cue shaft..."
              rows={4}
              disabled={isPending}
            />
          </div>

          {/* Specs Sub-section */}
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-bold text-primary mb-3">Cue Technical Specifications</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold">Weight</label>
                <Input value={weight} onChange={e => setWeight(e.target.value)} placeholder="19 oz" disabled={isPending} className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold">Length</label>
                <Input value={length} onChange={e => setLength(e.target.value)} placeholder="58 inch" disabled={isPending} className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold">Tip Size / Brand</label>
                <Input value={tip} onChange={e => setTip(e.target.value)} placeholder="Kamui Soft" disabled={isPending} className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold">Joint Pin</label>
                <Input value={joint} onChange={e => setJoint(e.target.value)} placeholder="Uni-Loc" disabled={isPending} className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold">Shaft Model</label>
                <Input value={shaft} onChange={e => setShaft(e.target.value)} placeholder="REVO 12.4" disabled={isPending} className="h-9 text-xs" />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-1">
            <label className="text-xs font-semibold">Key Features (comma separated)</label>
            <Input
              value={features}
              onChange={e => setFeatures(e.target.value)}
              placeholder="REVO Shaft, Irish Linen Wrap, Vibration dampening"
              disabled={isPending}
            />
          </div>

        </form>

        {/* Sticky footer buttons — always visible at bottom of modal */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6 sticky bottom-0 bg-card pb-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => setModalOpen(false)}
            disabled={isPending}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            disabled={isPending || isUploading}
            className="rounded-full px-8"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              'Save Product'
            )}
          </Button>
        </div>
      </Modal>

      {/* WhatsApp Requirement Modal */}
      <Modal
        isOpen={showWhatsappModal}
        onClose={() => setShowWhatsappModal(false)}
        title="⚠ Nomor WhatsApp Belum Diisi"
        description="Untuk mulai menjual produk, silakan lengkapi nomor WhatsApp terlebih dahulu."
        className="max-w-md"
      >
        <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-border">
          <Button variant="outline" onClick={() => setShowWhatsappModal(false)} className="rounded-full">
            Batal
          </Button>
          <Button onClick={() => router.push('/dashboard/profile')} className="rounded-full">
            Lengkapi Profil
          </Button>
        </div>
      </Modal>
    </>
  );
}
