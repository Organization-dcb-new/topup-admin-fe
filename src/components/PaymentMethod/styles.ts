// Token tampilan menu pembayaran (metode + kategori), versi neo-brutalism.
// Kelas `.nb-*` ditulis unlayered di src/styles/style.css, jadi menang atas
// utility bawaan komponen shadcn (border/rounded/shadow) tanpa perlu mengubah
// komponen globalnya.
//
// Dipakai bersama oleh src/components/PaymentMethod/* dan
// src/components/PaymentMethodCategory/* supaya dua halaman yang bersebelahan
// di sidebar tidak pelan-pelan menyimpang satu sama lain.

/** Kartu pembungkus di halaman: kepala halaman, toolbar, dan blok status. */
export const pmCard = 'nb-frame nb-frame-thick nb-sd bg-white'

/** Kotak ikon di sebelah judul halaman. */
export const pmPageIcon =
  'nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 shrink-0 items-center justify-center'

export const pmPageTitle = 'text-2xl font-black uppercase leading-none tracking-tight'

/** Label status ringkas di sisi kanan judul halaman. Dipasangkan dengan
 *  utility warna latar (`bg-[#c9f24d]`, dst.). */
export const pmStatusTag =
  'nb-frame nb-frame-thin nb-sd-sm inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.12em]'

/**
 * Isi dialog/alert-dialog. Portal Radix dirender di luar pembungkus `.nb`
 * milik DashboardLayout, jadi kelas `nb` dipasang lagi supaya variabel
 * `--nb-ink` (dipakai `.nb-frame`/`.nb-sd`) tetap terbaca.
 */
export const pmDialog = 'nb nb-frame nb-frame-thick nb-sd-lg gap-0 bg-white p-0'

/** Kepala dialog. Warna latar sengaja dilepas ke utility Tailwind supaya tiap
 *  aksi (tambah/ubah/hapus) punya aksen sendiri. */
export const pmDialogHeader = 'border-b-4 border-[#111] px-5 py-4'
export const pmDialogTitle = 'text-xl font-black uppercase leading-none tracking-tight'
export const pmDialogDesc = 'text-xs font-bold text-[#111]/70'

/** Kotak ikon di kepala dialog. */
export const pmDialogIcon =
  'nb-frame nb-frame-thin flex h-9 w-9 shrink-0 items-center justify-center bg-white'

export const pmLabel = 'text-[11px] font-black uppercase tracking-[0.14em]'
export const pmHint = 'text-xs font-bold text-[#111]/70'
export const pmError = 'text-[11px] font-black uppercase tracking-wide text-[#ff4d3d]'

/** Input teks/angka. `nb-field` yang memberi efek terangkat saat fokus. */
export const pmField =
  'nb-field nb-frame nb-frame-thin nb-sd-sm h-11 bg-white text-sm font-bold text-[#111] placeholder:font-medium placeholder:text-[#111]/40 focus-visible:ring-0'

/** Tombol footer dialog. Dipasangkan dengan utility warna latar. */
export const pmBtn =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm inline-flex h-11 cursor-pointer items-center justify-center gap-2 px-5 text-xs font-black uppercase tracking-[0.14em] text-[#111] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[5.5rem]'

/** Tombol ikon di kolom aksi tabel. */
export const pmIconBtn =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-[#111] disabled:cursor-not-allowed disabled:opacity-60'

/** Tombol tambah di toolbar daftar. */
export const pmAddBtn =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-9 w-full cursor-pointer items-center justify-center gap-2 px-3 text-xs font-black uppercase tracking-[0.12em] text-[#111] sm:w-auto'

/** Area unggah ikon. `nb-drop` yang mengurus efek angkat saat disentuh. */
export const pmDrop =
  'nb-frame nb-frame-thick nb-sd-sm nb-drop group relative flex h-40 w-full cursor-pointer items-center justify-center bg-[#f5f1e8] outline-none disabled:cursor-not-allowed'

/** Bilah progres unggahan. */
export const pmProgress = 'nb-frame nb-frame-thin h-3 w-full bg-white [&>div]:bg-[#c9f24d]'

/** Baris sakelar (aktif/nonaktif) di dalam form. */
export const pmSwitchRow =
  'nb-frame nb-frame-thin flex items-center justify-between gap-3 bg-[#f5f1e8] px-3 py-2.5'

/**
 * Sakelar shadcn: sudutnya dikotakkan dan warnanya diganti. Ukuran bawaan
 * (`h-[1.15rem] w-8`) sengaja dipertahankan supaya jarak geser thumb yang
 * dihitung komponennya sendiri tetap pas di dalam garis 2px.
 */
export const pmSwitch =
  'nb-frame nb-frame-thin data-[state=checked]:bg-[#c9f24d] data-[state=unchecked]:bg-white [&>span]:size-3.5 [&>span]:rounded-none [&>span]:bg-[#111]'

/** Tanda kecil di dalam sel tabel (penyedia, status, dst.). */
export const pmTag =
  'nb-frame nb-frame-thin inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#111]'

/** Teks kode/slug di dalam sel tabel. */
export const pmCode =
  'nb-frame nb-frame-thin inline-block bg-[#f5f1e8] px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#111]'

/** Ikon kecil di dalam sel tabel. */
export const pmCellIcon =
  'nb-frame nb-frame-thin h-10 w-10 bg-white object-contain p-0.5'

/** Kotak centang shadcn: sudutnya dikotakkan, centangnya jadi hijau limau. */
export const pmCheckbox =
  'nb-frame nb-frame-thin size-5 rounded-none bg-white shadow-none data-[state=checked]:bg-[#c9f24d] data-[state=checked]:text-[#111] focus-visible:ring-0'

/** Daftar bergulir di dalam dialog (mis. pilih metode untuk sebuah kategori). */
export const pmListBox =
  'nb-frame nb-frame-thin max-h-64 space-y-1 overflow-y-auto bg-[#f5f1e8] p-2'

/** Satu baris di dalam `pmListBox`. */
export const pmListItem =
  'flex cursor-pointer items-center gap-3 border-2 border-transparent px-2 py-2.5 text-sm font-bold text-[#111] transition-colors hover:border-[#111] hover:bg-[#ffd84d]'
