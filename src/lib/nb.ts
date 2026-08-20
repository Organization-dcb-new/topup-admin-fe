// Kosakata kelas neo-brutalism yang dipakai lintas menu (Penyedia, Referral,
// Keamanan). Kelas `.nb-*` ditulis unlayered di src/styles/style.css, jadi
// menang atas utility bawaan komponen shadcn (border/rounded/shadow) tanpa
// perlu mengubah komponen globalnya.
//
// Dipisah dari `src/components/Dashboard/styles.ts` dan
// `src/components/Transaction/styles.ts` yang isinya token khusus satu halaman;
// berkas ini hanya menampung yang dipakai lebih dari satu menu.

/** Palet aksen. Dipakai sebagai latar kepala kartu, ikon, dan badge. */
export const nbAccent = {
  lime: 'bg-[#c9f24d]',
  cyan: 'bg-[#6fe3f5]',
  pink: 'bg-[#ff9ed2]',
  orange: 'bg-[#ff9d3d]',
  yellow: 'bg-[#ffd84d]',
  red: 'bg-[#ff4d3d]',
  cream: 'bg-[#f5f1e8]',
  white: 'bg-white',
} as const

/* -------------------------------------------------------------------------- */
/* Kerangka halaman                                                            */
/* -------------------------------------------------------------------------- */

/** Kotak besar: kepala halaman, pembungkus tabel, kartu ringkasan. */
export const nbPanel = 'nb-frame nb-frame-thick nb-sd bg-white'
/** Kotak kecil di dalam panel (stat tile, baris info). */
export const nbBox = 'nb-frame nb-frame-thin nb-sd-sm bg-white'
/** Kepala panel. Warna latarnya diisi terpisah lewat `nbAccent`. */
export const nbPanelHeader = 'border-b-4 border-[#111] px-4 py-3'

export const nbPageTitle = 'text-2xl font-black uppercase leading-none tracking-tight'
/** Sub-judul halaman: stabilo kuning supaya kontras dengan judul hitam tebal. */
export const nbPageSubtitle = 'inline-block bg-[#ffd84d] px-1.5 py-0.5 text-xs font-bold'
export const nbSectionTitle = 'text-sm font-black uppercase tracking-tight'
export const nbHint = 'text-xs font-bold text-[#111]/70'
export const nbLabel = 'text-[11px] font-black uppercase tracking-[0.14em]'
export const nbMutedLabel = 'text-[11px] font-black uppercase tracking-[0.12em] text-[#111]/60'
export const nbError = 'text-[11px] font-black uppercase tracking-wide text-[#ff4d3d]'

/** Ikon persegi di sebelah judul halaman. */
export const nbPageIcon =
  'nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 shrink-0 items-center justify-center'
/** Label status di sisi kanan judul halaman (memuat/gagal/total). */
export const nbTag =
  'nb-frame nb-frame-thin nb-sd-sm inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.12em]'
/** Penanda kecil di dalam sel tabel — pengganti `<Badge>` shadcn. */
export const nbBadge =
  'nb-frame nb-frame-thin inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em]'
/** Cuplikan kode/JSON. */
export const nbCode =
  'nb-frame nb-frame-thin inline-block bg-[#f5f1e8] px-1.5 py-0.5 font-mono text-xs font-bold'
/** Tautan di dalam tabel. */
export const nbLink =
  'nb-focus font-black underline decoration-2 underline-offset-2 hover:bg-[#ffd84d]'

/* -------------------------------------------------------------------------- */
/* Kontrol                                                                     */
/* -------------------------------------------------------------------------- */

/** Tombol utama. Warna latarnya diisi terpisah lewat `nbAccent`. */
export const nbButton =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm inline-flex h-10 cursor-pointer items-center justify-center gap-2 px-4 text-xs font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-60'
/** Tombol di footer dialog — sedikit lebih tinggi supaya sejajar dengan input. */
export const nbDialogButton =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm inline-flex h-11 cursor-pointer items-center justify-center gap-2 px-5 text-xs font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[5.5rem]'
/** Tombol ikon di dalam baris tabel. */
export const nbIconButton =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60'

export const nbInput =
  'nb-field nb-frame nb-frame-thin nb-sd-sm h-11 bg-white text-sm font-bold text-[#111] placeholder:font-medium placeholder:text-[#111]/40 focus-visible:ring-0'
export const nbTextarea =
  'nb-field nb-frame nb-frame-thin nb-sd-sm bg-white font-mono text-sm font-bold text-[#111] placeholder:font-medium placeholder:text-[#111]/40 focus-visible:ring-0'
export const nbSwitch = 'nb-switch'

/** `SelectContent` dirender lewat portal di luar pembungkus `.nb`, jadi kelas
 *  `nb` dipasang lagi supaya variabel `--nb-ink` tetap terbaca. */
export const nbSelectTrigger =
  'nb-frame nb-frame-thin nb-sd-sm nb-focus h-10 bg-white font-black uppercase tracking-[0.12em] text-[#111] focus-visible:ring-0'
export const nbSelectContent = 'nb nb-frame nb-frame-thin nb-sd bg-white'
export const nbSelectItem =
  'rounded-none font-black uppercase tracking-[0.12em] text-[#111] focus:bg-[#ffd84d] focus:text-[#111]'

/* -------------------------------------------------------------------------- */
/* Dialog                                                                      */
/* -------------------------------------------------------------------------- */

export const nbDialog =
  'nb nb-frame nb-frame-thick nb-sd-lg gap-0 overflow-hidden bg-white p-0 sm:max-w-lg'
/** Kepala dialog. Warna latarnya diisi terpisah lewat `nbAccent`. */
export const nbDialogHeader = 'border-b-4 border-[#111] px-5 py-4'
export const nbDialogIcon =
  'nb-frame nb-frame-thin flex h-9 w-9 shrink-0 items-center justify-center bg-white'
export const nbDialogTitle = 'text-xl font-black uppercase leading-none tracking-tight'
export const nbDialogBody = 'space-y-5 px-5 py-5'
/** Dipakai pada `DialogFooter`/`AlertDialogFooter` yang ada di dalam badan
 *  dialog, jadi garis pemisahnya dipasang sebagai border atas. */
export const nbDialogFooter = 'gap-2 border-t-4 border-[#111] pt-5 sm:pt-5'

/* -------------------------------------------------------------------------- */
/* Tabel & paginasi                                                            */
/* -------------------------------------------------------------------------- */

export const nbTable = 'nb nb-table nb-sd'
export const nbPagination = 'nb nb-pagination'
