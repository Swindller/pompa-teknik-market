import { getProducts } from '@/actions/products'
import { getCategories } from '@/actions/categories'
import { ProductsClient } from './ProductsClient'

export const dynamic = 'force-dynamic'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category_id?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const { data: products, count } = await getProducts({
    search: params.search,
    category_id: params.category_id,
    page,
    pageSize: 20,
  })
  const categories = await getCategories()

  return (
    <ProductsClient
      products={products}
      categories={categories}
      total={count}
      page={page}
      pageSize={20}
      search={params.search}
      categoryFilter={params.category_id}
    />
  )
}
