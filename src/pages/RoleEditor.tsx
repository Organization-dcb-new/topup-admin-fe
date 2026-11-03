import { useId, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { ArrowLeft, Lock, Trash2, UserCog } from 'lucide-react'

import { AuthAlert, AuthPanelHeader, AuthSubmitButton, HudCard } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DeleteRoleDialog } from '@/components/Roles/DeleteRoleDialog'
import { PermissionMatrix } from '@/components/Roles/PermissionMatrix'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { roleErrorKey, usePermissionCatalog, useRole, useSaveRole } from '@/hooks/useRoles'
import { cn } from '@/lib/utils'
import type { PermissionGroup, RoleDetail } from '@/types/role'

/** Create (/roles/new) and edit (/roles/:id) share this page. */
export default function RoleEditorPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const role = useRole(id)
  const catalog = usePermissionCatalog()
  const isLoading = catalog.isLoading || (!!id && role.isLoading)
  const error = catalog.error ?? role.error
  const loadError = error ? roleErrorKey(error) : null

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-5xl space-y-5'>
        <Link
          to='/roles'
          className='group inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-brand-purple'
        >
          <ArrowLeft
            className='size-3.5 transition-transform duration-300 ease-hud group-hover:-translate-x-0.5'
            aria-hidden
          />
          {t('rolesPage.backToRoles')}
        </Link>

        {isLoading ? (
          <div className='h-[32rem] animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
        ) : loadError ? (
          <AuthAlert>{loadError.detail ?? t(loadError.key)}</AuthAlert>
        ) : (
          // Keyed so the form's state starts from the loaded role instead of syncing in an effect.
          <RoleForm key={id ?? 'new'} role={role.data} groups={catalog.data ?? []} />
        )}
      </div>
    </DashboardLayout>
  )
}

function sameSet(selected: ReadonlySet<string>, codes: string[]) {
  return selected.size === codes.length && codes.every((code) => selected.has(code))
}

interface RoleFormProps {
  role?: RoleDetail
  groups: PermissionGroup[]
}

function RoleForm({ role, groups }: RoleFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { can } = usePermissions()
  const save = useSaveRole()
  const nameId = useId()
  const descriptionId = useId()
  const [name, setName] = useState(role?.name ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [selected, setSelected] = useState<Set<string>>(() => new Set(role?.permissions ?? []))
  const [deleteOpen, setDeleteOpen] = useState(false)

  const readOnly = role ? !can(PERM.roleUpdate) : !can(PERM.roleCreate)
  // The backend refuses to rename the built-in roles; their permissions stay editable.
  const nameLocked = readOnly || !!role?.is_system
  const error = save.error ? roleErrorKey(save.error) : null
  const dirty =
    !role || name !== role.name || description !== role.description || !sameSet(selected, role.permissions)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (readOnly || !name.trim()) return
    save.mutate(
      {
        role,
        payload: {
          name: name.trim(),
          description: description.trim(),
          permission_codes: [...selected],
        },
      },
      {
        onSuccess: (savedId) => {
          toast.success(role ? t('rolesPage.saved') : t('rolesPage.created', { name: name.trim() }))
          if (!role) navigate(`/roles/${savedId}`, { replace: true })
        },
      }
    )
  }

  return (
    <>
      <HudCard className='animate-in fade-in slide-in-from-bottom-4 duration-700 ease-hud'>
        <AuthPanelHeader
          eyebrow={role ? t('rolesPage.editEyebrow') : t('rolesPage.newEyebrow')}
          icon={UserCog}
          title={role ? role.name : t('rolesPage.newRole')}
          description={
            readOnly
              ? t('rolesPage.readOnlyNote')
              : role?.is_system
                ? t('rolesPage.systemNote')
                : t('rolesPage.editorSubtitle')
          }
        />

        {role && (
          <div className='-mt-3 mb-7 flex flex-wrap items-center gap-2'>
            <code className='bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 hud-clip-sm'>{role.slug}</code>
            {role.is_system && (
              <span className='inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 hud-clip-sm'>
                <Lock className='size-3' aria-hidden />
                {t('rolesPage.system')}
              </span>
            )}
          </div>
        )}

        <form noValidate onSubmit={submit} className='space-y-8'>
          {error && <AuthAlert key={error.key}>{error.detail ?? t(error.key)}</AuthAlert>}

          <div className='grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]'>
            <div className='space-y-2'>
              <Label htmlFor={nameId} className={hudLabelClass}>
                {t('rolesPage.nameLabel')}
              </Label>
              <Input
                id={nameId}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={nameLocked}
                maxLength={100}
                placeholder={t('rolesPage.namePlaceholder')}
                className={cn(hudInputClass, 'disabled:opacity-70')}
              />
              {role?.is_system && <p className='text-xs text-slate-500'>{t('rolesPage.systemNameLocked')}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor={descriptionId} className={hudLabelClass}>
                {t('rolesPage.descriptionLabel')}
              </Label>
              <Textarea
                id={descriptionId}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={readOnly}
                rows={2}
                placeholder={t('rolesPage.descriptionPlaceholder')}
                className={cn(hudInputClass, 'h-auto min-h-12 resize-none py-3 disabled:opacity-70')}
              />
            </div>
          </div>

          <PermissionMatrix groups={groups} selected={selected} onChange={setSelected} readOnly={readOnly} />

          {!readOnly && (
            // Sticks to the viewport bottom while scrolling through the permission list.
            <div className='sticky bottom-0 -mx-5 -mb-7 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:-mb-9 sm:flex-row sm:items-center sm:justify-between sm:px-8'>
              <div className='flex items-center gap-2'>
                <Link
                  to='/roles'
                  className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900'
                >
                  {t('rolesPage.cancel')}
                </Link>
                {role && !role.is_system && (
                  <Can permission={PERM.roleDelete}>
                    <button
                      type='button'
                      onClick={() => setDeleteOpen(true)}
                      className='inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50'
                    >
                      <Trash2 className='size-4' aria-hidden />
                      {t('rolesPage.delete')}
                    </button>
                  </Can>
                )}
              </div>
              <div className='sm:w-56'>
                <AuthSubmitButton
                  pending={save.isPending}
                  pendingLabel={t('rolesPage.saving')}
                  cooldown={0}
                  disabled={!dirty || !name.trim()}
                >
                  {role ? t('rolesPage.save') : t('rolesPage.create')}
                </AuthSubmitButton>
              </div>
            </div>
          )}
        </form>
      </HudCard>

      <DeleteRoleDialog
        role={deleteOpen && role ? role : null}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate('/roles', { replace: true })}
      />
    </>
  )
}
