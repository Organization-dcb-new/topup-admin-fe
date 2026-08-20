// Token kontrol penyaring transaksi, versi neo-brutalism.
// Kelas `.nb-*` ditulis unlayered di src/styles/style.css, jadi menang atas
// utility bawaan komponen shadcn (border/rounded/shadow) tanpa perlu
// mengubah komponen globalnya.

/** Pemicu popover/combobox: kotak putih bergaris, menguning saat disentuh. */
export const txControl =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-10 w-full min-w-0 cursor-pointer bg-white text-left text-sm font-bold text-[#111] hover:bg-[#ffd84d] hover:text-[#111] focus-visible:ring-0'

/** Input teks/angka. `nb-field` yang memberi efek terangkat saat fokus. */
export const txField =
  'nb-field nb-frame nb-frame-thin nb-sd-sm h-10 bg-white text-sm font-bold text-[#111] placeholder:font-medium placeholder:text-[#5f5f5f] focus-visible:ring-0'

/** Isi popover. Portal Radix ada di luar pembungkus `.nb`, jadi kelas `nb`
 *  dipasang lagi supaya variabel `--nb-ink` tetap terbaca. */
export const txPopover = 'nb nb-frame nb-frame-thick nb-sd bg-white p-0'

/** Tombol bersihkan satu penyaring. */
export const txClear =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center bg-[#ff9ed2]'

/** Label kecil di atas kontrol. */
export const txLabel = 'text-[11px] font-black uppercase tracking-[0.14em] text-[#111]/70'

/** Judul kelompok penyaring. */
export const txSectionTitle = 'text-xs font-black uppercase tracking-[0.14em]'

/** Baris daftar di dalam `Command` (combobox game & metode bayar). */
export const txCommandItem =
  'rounded-none font-bold text-[#111] data-[selected=true]:bg-[#ffd84d] data-[selected=true]:text-[#111]'
