import { getCollections } from '@/actions/collections'
import { CollectionsClient } from './CollectionsClient'

export const dynamic = 'force-dynamic'

export default async function CollectionsPage() {
  const collections = await getCollections()
  return <CollectionsClient collections={collections} />
}
