import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '../../ui/button'

type ViewMode = 'list' | 'create' | 'edit'

interface HeaderBlogProps {
  view: ViewMode
  setView: (view: ViewMode) => void
}

export default function HeaderBlog({ view, setView }: HeaderBlogProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold">
        {view === 'list' && 'List Blog'}
        {view === 'create' && 'Create New Blog'}
        {view === 'edit' && 'Edit Blog'}
      </h1>{' '}
      <div className="flex justify-between">
        {view === 'list' ? (
          <Button
            onClick={() => setView('create')}
            className="cursor-pointer text-white flex items-center gap-2"
          >
            <Plus size={16} /> Create
          </Button>
        ) : (
          <Button
            onClick={() => setView('list')}
            variant="outline"
            className="cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </Button>
        )}
      </div>
    </div>
  )
}
