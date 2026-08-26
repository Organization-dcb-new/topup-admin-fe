import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PermissionMatrix } from '@/components/Role/PermissionMatrix'
import { StepUpOtpSection } from '@/components/Auth/twofa/StepUpOtpSection'
import { usePermissionCatalog } from '@/hooks/usePermissionCatalog'
import { useStepUp } from '@/hooks/useStepUp'
import {
  useCreateRole,
  useRoleDetail,
  useSetRolePermissions,
  useUpdateRole,
} from '@/hooks/useRoles'
import type { Role } from '@/types/permission'

interface RoleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Kosong berarti membuat role baru. */
  role?: Role | null
}

/**
 * Isi form dipisah ke komponen sendiri dan diberi `key`, sehingga tiap kali
 * dialog dibuka atau role yang diedit berganti, React memasangnya ulang dari
 * nol. Itu menggantikan reset state lewat useEffect, yang memicu render
 * berantai dan tidak pernah benar-benar sinkron saat props berubah.
 */
export const RoleForm = ({ open, onOpenChange, role }: RoleFormProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {/*
      Kolom flex dengan tinggi berbatas dan overflow-hidden. Header dan footer
      tetap diam, hanya badan yang menggulir. `p-0` dan `gap-0` mematikan
      padding/gap bawaan DialogContent supaya tiap bagian mengatur paddingnya
      sendiri dan garis pemisahnya bisa membentang penuh.
    */}
    <DialogContent className='flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'>
      {open && (
        <RoleFormBody
          key={role?.id ?? 'new'}
          role={role ?? null}
          onDone={() => onOpenChange(false)}
        />
      )}
    </DialogContent>
  </Dialog>
)

const RoleFormBody = ({
  role,
  onDone,
}: {
  role: Role | null
  onDone: () => void
}) => {
  const { t } = useTranslation('common')
  const isEdit = !!role
  const isSystem = !!role?.is_system

  const [name, setName] = useState(role?.name ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [nameError, setNameError] = useState<string | null>(null)

  const { data: catalog = [], isLoading: catalogLoading } = usePermissionCatalog()
  const { data: detail, isLoading: detailLoading } = useRoleDetail(role?.id ?? null)

  // Permission yang tampil diturunkan dari data server sampai user menyentuhnya.
  // Tanpa pola ini, mengisi state dari hasil query menuntut useEffect.
  const [draftPermissions, setDraftPermissions] = useState<string[] | null>(null)
  const permissions = draftPermissions ?? detail?.permissions ?? []

  const createRole = useCreateRole(onDone)
  const updateRole = useUpdateRole(role?.id ?? '', onDone)
  const setRolePermissions = useSetRolePermissions(role?.id ?? '', onDone)

  // Mengubah permission sebuah role mengubah hak akses semua pemegangnya
  // sekaligus, jadi backend menuntut kode TOTP sekali pakai kalau aktornya
  // sudah mengaktifkan 2FA.
  const stepUp = useStepUp()

  const isPending =
    createRole.isPending || updateRole.isPending || setRolePermissions.isPending

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError(t('rolePage.fieldNameRequired'))
      return
    }
    setNameError(null)
    if (!stepUp.canSubmit) return

    if (!isEdit) {
      createRole.mutate(
        {
          name: trimmed,
          description: description.trim(),
          permission_codes: permissions,
          otp: stepUp.otp,
        },
        { onError: stepUp.handleError },
      )
      return
    }

    // Nama dan permission adalah dua endpoint terpisah di backend. Role bawaan
    // sistem tidak bisa di-rename, jadi hanya permission-nya yang dikirim.
    if (isSystem) {
      setRolePermissions.mutate(
        { permission_codes: permissions, otp: stepUp.otp },
        { onError: stepUp.handleError },
      )
      return
    }

    // Hanya panggilan kedua yang membawa kode: PUT /admin/roles/:id sengaja
    // tidak digerbang di backend karena hanya mengubah nama dan deskripsi.
    // Kalau keduanya digerbang, satu kali simpan menuntut dua kode berbeda.
    updateRole.mutate(
      { name: trimmed, description: description.trim() },
      {
        onSuccess: () =>
          setRolePermissions.mutate(
            { permission_codes: permissions, otp: stepUp.otp },
            { onError: stepUp.handleError },
          ),
      },
    )
  }

  return (
    <>
      <DialogHeader className='shrink-0 border-b border-border/70 px-6 py-4'>
        <DialogTitle>
          {isEdit ? t('rolePage.formEditTitle') : t('rolePage.formCreateTitle')}
        </DialogTitle>
        <DialogDescription>{t('rolePage.formDescription')}</DialogDescription>
      </DialogHeader>

      <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='role-name'>{t('rolePage.fieldName')}</Label>
            <Input
              id='role-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('rolePage.fieldNamePlaceholder')}
              disabled={isPending || isSystem}
              className='rounded-lg'
            />
            {isSystem && (
              <p className='text-xs text-muted-foreground'>{t('rolePage.listHint')}</p>
            )}
            {nameError && <p className='text-xs text-destructive'>{nameError}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='role-description'>{t('rolePage.fieldDescription')}</Label>
            <Textarea
              id='role-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('rolePage.fieldDescriptionPlaceholder')}
              disabled={isPending || isSystem}
              className='min-h-[38px] rounded-lg'
              rows={1}
            />
          </div>
        </div>

        <div className='space-y-1'>
          <h3 className='text-sm font-semibold text-foreground'>
            {t('rolePage.matrixTitle')}
          </h3>
          <p className='text-xs text-muted-foreground'>{t('rolePage.matrixHint')}</p>
        </div>

        <PermissionMatrix
          groups={catalog}
          selected={permissions}
          onChange={setDraftPermissions}
          isLoading={catalogLoading || (isEdit && detailLoading)}
          disabled={isPending}
        />
      </div>

      {/* Di luar badan yang menggulir: kolom OTP harus terlihat tanpa perlu
          menggulir melewati seluruh matriks permission lebih dulu. */}
      {stepUp.required && (
        <div className='shrink-0 border-t border-border/70 px-6 py-4'>
          <StepUpOtpSection
            code={stepUp.code}
            onCodeChange={stepUp.changeCode}
            error={stepUp.error}
            disabled={isPending}
          />
        </div>
      )}

      <DialogFooter className='shrink-0 border-t border-border/70 px-6 py-4'>
        <Button variant='outline' onClick={onDone} disabled={isPending}>
          {t('rolePage.cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={isPending || !stepUp.canSubmit}>
          {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' aria-hidden />}
          {isPending ? t('rolePage.saving') : t('rolePage.save')}
        </Button>
      </DialogFooter>
    </>
  )
}
