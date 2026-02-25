'use client'

import { deleteCategory, toggleCategoryActive } from '@/actions/categories'
import { CategoryForm } from '@/components/admin/CategoryForm'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Category } from '@/lib/types'
import { MAIN_TYPE_LABELS } from '@/lib/utils'
import {
  ChevronRight,
  FolderOpen,
  FolderTree,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface CategoriesClientProps {
  categories: Category[]
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  // Build tree
  const buildTree = (cats: Category[], parentId: string | null = null, depth = 0): (Category & { depth: number })[] => {
    const result: (Category & { depth: number })[] = []
    cats
      .filter((c) => c.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
      .forEach((cat) => {
        result.push({ ...cat, depth })
        result.push(...buildTree(cats, cat.id, depth + 1))
      })
    return result
  }

  const treeCategories = buildTree(categories)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const result = await deleteCategory(deleteTarget.id)
    setDeleteLoading(false)
    if (result.error) {
      showToast('error', result.error)
    } else {
      showToast('success', 'Kategori silindi.')
      setDeleteTarget(null)
      router.refresh()
    }
  }

  const handleToggleActive = async (cat: Category) => {
    setToggling(cat.id)
    const result = await toggleCategoryActive(cat.id, !cat.is_active)
    setToggling(null)
    if (result.error) {
      showToast('error', result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
          <p className="text-gray-500 mt-1">
            {categories.length} kategori — Pompa ve yedek parça kategorileri yönetimi
          </p>
        </div>
        <Button leftIcon={<Plus />} onClick={() => setCreateOpen(true)}>
          Yeni Kategori
        </Button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {treeCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderTree className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Henüz kategori yok</p>
            <p className="text-gray-400 text-sm mt-1">İlk kategorinizi oluşturmak için butona tıklayın.</p>
            <Button className="mt-4" leftIcon={<Plus />} onClick={() => setCreateOpen(true)}>
              Yeni Kategori
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ana Tür
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
              {treeCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div
                      className="flex items-center gap-2"
                      style={{ paddingLeft: `${cat.depth * 20}px` }}
                    >
                      {cat.depth > 0 && (
                        <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                      )}
                      <FolderOpen className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {cat.main_type && (
                      <Badge variant={cat.main_type === 'pompa' ? 'info' : 'purple'}>
                        {MAIN_TYPE_LABELS[cat.main_type]}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {cat.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{cat.sort_order}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(cat)}
                      disabled={toggling === cat.id}
                      className="relative inline-flex items-center cursor-pointer"
                    >
                      <div
                        className={`w-10 h-6 rounded-full transition-colors ${
                          cat.is_active ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <div
                          className={`absolute top-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            cat.is_active ? 'translate-x-[18px]' : 'translate-x-[2px]'
                          }`}
                        />
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditCategory(cat)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Yeni Kategori Oluştur"
        size="md"
      >
        <CategoryForm
          categories={categories}
          onSuccess={() => {
            setCreateOpen(false)
            router.refresh()
          }}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editCategory}
        onClose={() => setEditCategory(null)}
        title="Kategori Düzenle"
        size="md"
      >
        {editCategory && (
          <CategoryForm
            category={editCategory}
            categories={categories}
            onSuccess={() => {
              setEditCategory(null)
              router.refresh()
            }}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Kategoriyi Sil"
        message={`"${deleteTarget?.name}" kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
      />
    </div>
  )
}
