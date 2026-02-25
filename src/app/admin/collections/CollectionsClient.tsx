'use client'

import { deleteCollection, toggleCollectionActive } from '@/actions/collections'
import { CollectionForm } from '@/components/admin/CollectionForm'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Collection } from '@/lib/types'
import { COLLECTION_TYPE_LABELS } from '@/lib/utils'
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface CollectionsClientProps {
  collections: Collection[]
}

const TYPE_BADGE: Record<string, 'success' | 'info' | 'warning' | 'purple'> = {
  yeni_gelenler: 'success',
  cok_satanlar: 'info',
  indirimdekiler: 'warning',
  ozel: 'purple',
}

const DEFAULT_COLLECTIONS = ['yeni_gelenler', 'cok_satanlar', 'indirimdekiler']

export function CollectionsClient({ collections }: CollectionsClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const [editCollection, setEditCollection] = useState<Collection | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const result = await deleteCollection(deleteTarget.id)
    setDeleteLoading(false)
    if (result.error) {
      showToast('error', result.error)
    } else {
      showToast('success', 'Koleksiyon silindi.')
      setDeleteTarget(null)
      router.refresh()
    }
  }

  const handleToggleActive = async (col: Collection) => {
    setToggling(col.id)
    const result = await toggleCollectionActive(col.id, !col.is_active)
    setToggling(null)
    if (result.error) {
      showToast('error', result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Koleksiyonlar</h1>
          <p className="text-gray-500 mt-1">
            {collections.length} koleksiyon — Ürün gruplandırma yönetimi
          </p>
        </div>
        <Button leftIcon={<Plus />} onClick={() => setCreateOpen(true)}>
          Yeni Koleksiyon
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Layers className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Henüz koleksiyon yok</p>
            <Button className="mt-4" leftIcon={<Plus />} onClick={() => setCreateOpen(true)}>
              Yeni Koleksiyon
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Koleksiyon
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tür
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sıra
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {collections.map((col) => (
                <tr key={col.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{col.name}</div>
                      {col.description && (
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{col.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={TYPE_BADGE[col.collection_type] || 'neutral'}>
                      {COLLECTION_TYPE_LABELS[col.collection_type] || col.collection_type}
                    </Badge>
                    {DEFAULT_COLLECTIONS.includes(col.collection_type) && (
                      <Badge variant="neutral" className="ml-2">
                        Varsayılan
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {col.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{col.sort_order}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(col)}
                      disabled={toggling === col.id}
                      className="relative inline-flex items-center cursor-pointer"
                    >
                      <div
                        className={`w-10 h-6 rounded-full transition-colors ${
                          col.is_active ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <div
                          className={`absolute top-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            col.is_active ? 'translate-x-[18px]' : 'translate-x-[2px]'
                          }`}
                        />
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditCollection(col)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {!DEFAULT_COLLECTIONS.includes(col.collection_type) && (
                        <button
                          onClick={() => setDeleteTarget(col)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Yeni Koleksiyon" size="md">
        <CollectionForm
          onSuccess={() => {
            setCreateOpen(false)
            router.refresh()
          }}
        />
      </Modal>

      <Modal isOpen={!!editCollection} onClose={() => setEditCollection(null)} title="Koleksiyon Düzenle" size="md">
        {editCollection && (
          <CollectionForm
            collection={editCollection}
            onSuccess={() => {
              setEditCollection(null)
              router.refresh()
            }}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Koleksiyonu Sil"
        message={`"${deleteTarget?.name}" koleksiyonunu silmek istediğinize emin misiniz?`}
      />
    </div>
  )
}
