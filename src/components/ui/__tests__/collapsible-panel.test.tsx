import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { CollapsiblePanel } from '@/components/ui/collapsible-panel'

/**
 * jsdom tidak menjalankan transisi CSS dan selalu melaporkan `scrollHeight` 0,
 * jadi gerak animasinya tidak bisa diuji di sini. Yang diuji adalah kontrak yang
 * memang menentukan benar-salahnya: isi tetap ada di DOM (supaya tingginya bisa
 * dianimasikan) tetapi tidak boleh terjangkau saat tertutup.
 */
describe('CollapsiblePanel', () => {
  it('menampilkan isi dan membiarkannya terjangkau saat terbuka', () => {
    render(
      <CollapsiblePanel open id='panel'>
        <button type='button'>Aksi</button>
      </CollapsiblePanel>,
    )

    const panel = document.getElementById('panel')
    expect(panel).not.toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: 'Aksi' })).toBeInTheDocument()
  })

  // Tanpa inert, tile yang tak terlihat masih ikut urutan tab dan masih
  // terbaca pembaca layar — panel yang "tersembunyi" hanya secara visual.
  it('mematikan isinya saat tertutup, tanpa melepasnya dari DOM', () => {
    render(
      <CollapsiblePanel open={false} id='panel'>
        <button type='button'>Aksi</button>
      </CollapsiblePanel>,
    )

    const panel = document.getElementById('panel')
    expect(panel).toHaveAttribute('inert')
    expect(panel).toHaveStyle({ height: '0px' })
    expect(panel?.textContent).toContain('Aksi')
  })

  it('tidak menganimasikan keadaan awal', () => {
    const { rerender } = render(
      <CollapsiblePanel open={false} id='panel'>
        <p>Isi</p>
      </CollapsiblePanel>,
    )
    expect(document.getElementById('panel')).toHaveStyle({ height: '0px' })

    rerender(
      <CollapsiblePanel open id='panel'>
        <p>Isi</p>
      </CollapsiblePanel>,
    )
    expect(document.getElementById('panel')).not.toHaveAttribute('inert')
  })
})
