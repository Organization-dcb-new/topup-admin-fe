import { Input } from '@/components/ui/input'
import { txField } from '@/components/Transaction/styles'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TransactionInputProps {
  value: string
  onChange: (value: string) => void
  id?: string
}

export default function TransactionSearchInput({ value, onChange, id }: TransactionInputProps) {
  const { t } = useTranslation('common')
  return (
    <div className='relative w-full min-w-0'>
      <Search
        className='pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#111]'
        strokeWidth={3}
        aria-hidden
      />
      <Input
        id={id}
        type='search'
        enterKeyHint='search'
        autoComplete='off'
        placeholder={t('transactionFilters.search.placeholder')}
        className={cn(txField, 'pl-9')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t('transactionFilters.search.ariaLabel')}
      />
    </div>
  )
}
