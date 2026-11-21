import { useTranslation } from 'react-i18next'
import { Check, CircleAlert } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { ProviderCredential } from '@/types/provider'

/** Which server env variables hold this supplier's credentials, and whether each is set. Values are never shown. */
export function ProviderCredentials({ credentials }: { credentials?: ProviderCredential[] }) {
  const { t } = useTranslation('common')
  const list = credentials ?? []
  if (list.length === 0) return <span className='text-xs text-slate-400'>—</span>

  return (
    <ul className='flex min-w-0 flex-wrap gap-1.5'>
      {list.map((credential) => {
        const label = credential.set
          ? t('providerPage.credentialSet', { env: credential.env })
          : t('providerPage.credentialMissing', { env: credential.env })
        return (
          <li
            key={credential.env}
            title={label}
            className={cn(
              'inline-flex max-w-full items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px]',
              credential.set ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
            )}
          >
            {credential.set ? <Check className='size-3 shrink-0' aria-hidden /> : <CircleAlert className='size-3 shrink-0' aria-hidden />}
            <span className='truncate'>{credential.env}</span>
            <span className='sr-only'>
              {credential.set ? t('providerPage.credentialStatusSet') : t('providerPage.credentialStatusMissing')}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
