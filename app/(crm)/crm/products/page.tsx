'use client'

import { useState } from 'react'

export const dynamic = 'force-dynamic'
import { Topbar } from '@/components/crm/Topbar'
import { ProductCatalog } from '@/components/crm/ProductCatalog'
import { ProductDetailModal } from '@/components/crm/ProductDetailModal'
import { ProductForm } from '@/components/crm/ProductForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useProducts } from '@/lib/hooks/useProducts'
import type { Product } from '@/lib/supabase/types'

export default function ProductsPage() {
  const { products, loading, createProduct, updateProduct } = useProducts()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showNewProductModal, setShowNewProductModal] = useState(false)

  async function handleCreateProduct(data: Partial<Product>) {
    const result = await createProduct(data)
    if (!result.error) {
      setShowNewProductModal(false)
    }
  }

  async function handleUpdateProduct(data: Partial<Product>) {
    if (editingProduct) {
      const result = await updateProduct(editingProduct.id, data)
      if (!result.error) {
        setEditingProduct(null)
      }
    }
  }

  if (loading) {
    return (
      <div>
        <Topbar title="Produkty" />
        <div className="p-8 text-center">Načítání...</div>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title="Produkty"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Produkty' }]}
        actions={
          <Button onClick={() => setShowNewProductModal(true)}>
            + Nový produkt
          </Button>
        }
      />

      <div className="p-8">
        <ProductCatalog 
          products={products} 
          onProductSelect={setSelectedProduct}
        />
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onEdit={setEditingProduct}
      />

      <Modal
        isOpen={showNewProductModal}
        onClose={() => setShowNewProductModal(false)}
        title="Nový produkt"
        size="xl"
      >
        <ProductForm
          onSubmit={handleCreateProduct}
          onCancel={() => setShowNewProductModal(false)}
        />
      </Modal>

      {editingProduct && (
        <Modal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          title={`Upravit: ${editingProduct.name}`}
          size="xl"
        >
          <ProductForm
            product={editingProduct}
            onSubmit={handleUpdateProduct}
            onCancel={() => setEditingProduct(null)}
          />
        </Modal>
      )}
    </div>
  )
}
