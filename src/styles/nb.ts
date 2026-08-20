/**
 * Token className neo-brutalism yang dipakai lintas halaman.
 *
 * Kelas `.nb-*`-nya sendiri didefinisikan unlayered di `src/styles/style.css`,
 * jadi menang atas utility bawaan komponen shadcn (border/rounded/shadow) tanpa
 * perlu mengubah komponen globalnya. Berkas ini hanya merangkai kelas-kelas itu
 * jadi pola yang berulang, supaya halaman yang digarap terpisah tetap seragam.
 *
 * Pola yang sudah lebih dulu ada — `src/components/Dashboard/styles.ts` dan
 * `src/components/Transaction/styles.ts` — sengaja dibiarkan apa adanya agar
 * halaman yang belum digarap tidak ikut berubah; nilai di sini dijaga selaras
 * dengan keduanya.
 */

/** Warna mentah, untuk tempat yang butuh nilai hex (mis. prop `fill` chart). */
export const nbInk = '#111111'
export const nbCream = '#f5f1e8'

/** Aksen latar. Dipakai di kepala kartu, ikon, tag, dan tombol. */
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

/* ---------------------------------------------------------------- kerangka */

/** Pembungkus isi halaman di dalam `DashboardLayout`. */
export const nbPage = 'mx-auto min-w-0 max-w-7xl space-y-5'

/** Panel polos bergaris tebal, padding diatur sendiri di pemakaian. */
export const nbPanel = 'nb-frame nb-frame-thick nb-sd bg-white'

/** Panel siap pakai dengan padding standar (kepala halaman, bar penyaring). */
export const nbPanelPad = 'nb-frame nb-frame-thick nb-sd bg-white p-4 sm:p-5'

/** Kartu berkepala: `nbCard` > `nbCardHead` (+ aksen) > `nbCardBody`. */
export const nbCard = 'nb-frame nb-frame-thick nb-sd gap-0 bg-white py-0'
export const nbCardHead = 'border-b-4 border-[#111] px-4 py-3'
export const nbCardBody = 'p-4'

/** Kotak kecil di dalam kartu (angka ringkasan, satu baris detail). */
export const nbTile = 'nb-frame nb-frame-thin nb-sd-sm bg-white p-3'

/** Ikon persegi di sebelah judul halaman. Pasangkan dengan `nbAccent`. */
export const nbPageIcon =
  'nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 shrink-0 items-center justify-center'

/* --------------------------------------------------------------- tipografi */

export const nbTitle = 'text-2xl font-black uppercase leading-none tracking-tight'
export const nbCardTitle = 'text-sm font-black uppercase tracking-tight text-[#111]'
export const nbSubtitle = 'text-xs font-bold leading-relaxed text-[#111]/70'
export const nbLabel = 'text-[11px] font-black uppercase tracking-[0.14em] text-[#111]/70'
export const nbMetaLabel = 'text-[10px] font-black uppercase tracking-[0.14em] text-[#111]/60'

/* ------------------------------------------------------------------ kendali */

/** Tombol standar (tinggi 36px) — warna latar ditentukan di pemakaian. */
export const nbBtn =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-9 cursor-pointer items-center justify-center gap-2 px-3 text-xs font-black uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-60'

/** Tombol besar untuk footer dialog (tinggi 44px). */
export const nbBtnLg =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 cursor-pointer px-5 text-xs font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[5.5rem]'

/** Tombol ikon persegi (tinggi 36px). */
export const nbIconBtn =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60'

/** Tombol ikon kecil untuk di dalam sel tabel (tinggi 32px). */
export const nbIconBtnSm =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60'

/** Tombol aksi di dalam baris tabel (ikon + label yang menyembunyi di ponsel). */
export const nbRowBtn =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-8 cursor-pointer items-center gap-1.5 px-2 text-[10px] font-black uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-60'

/** Pemicu popover/combobox (`Button variant='outline'`). */
export const nbControl =
  'nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-9 w-full min-w-0 cursor-pointer bg-white text-left text-sm font-bold text-[#111] hover:bg-[#ffd84d] hover:text-[#111] focus-visible:ring-0'

/** Input teks/angka. `nb-field` yang memberi efek terangkat saat fokus. */
export const nbField =
  'nb-field nb-frame nb-frame-thin nb-sd-sm h-9 bg-white text-sm font-bold text-[#111] placeholder:font-medium placeholder:text-[#111]/40 focus-visible:ring-0'

/** Versi `nbField` untuk formulir di dalam dialog (tinggi 44px). */
export const nbFieldLg =
  'nb-field nb-frame nb-frame-thin nb-sd-sm h-11 bg-white text-sm font-bold text-[#111] placeholder:font-medium placeholder:text-[#111]/40 focus-visible:ring-0'

/** Area teks banyak baris. */
export const nbTextarea =
  'nb-field nb-frame nb-frame-thin nb-sd-sm bg-white text-sm font-bold text-[#111] placeholder:font-medium placeholder:text-[#111]/40 focus-visible:ring-0'

/** Pesan galat di bawah input. Pasangkan input-nya dengan kelas `nb-invalid`. */
export const nbError = 'text-[11px] font-black uppercase tracking-wide text-[#ff4d3d]'

/* ------------------------------------------------------- portal radix (nb) */
/* Portal Radix dirender di luar pembungkus `.nb`, jadi kelas `nb` dipasang
   ulang supaya variabel `--nb-ink` yang dipakai `.nb-frame`/`.nb-sd` terbaca. */

export const nbPopover = 'nb nb-frame nb-frame-thick nb-sd bg-white p-0'
export const nbSelectTrigger =
  'nb-frame nb-frame-thin nb-sd-sm nb-focus h-9 bg-white font-bold text-[#111] focus-visible:ring-0'
export const nbSelectContent = 'nb nb-frame nb-frame-thin nb-sd bg-white'
export const nbSelectItem =
  'rounded-none font-bold text-[#111] focus:bg-[#ffd84d] focus:text-[#111]'
export const nbCommandItem =
  'rounded-none font-bold text-[#111] data-[selected=true]:bg-[#ffd84d] data-[selected=true]:text-[#111]'

/* ------------------------------------------------------------------ dialog */

export const nbDialog =
  'nb nb-frame nb-frame-thick nb-sd-lg gap-0 overflow-hidden bg-white p-0 sm:max-w-lg'
/** Varian untuk dialog panjang yang isinya perlu di-scroll. */
export const nbDialogScroll =
  'nb nb-frame nb-frame-thick nb-sd-lg max-h-[min(90vh,44rem)] gap-0 overflow-y-auto bg-white p-0 sm:max-w-lg'
/** Kepala dialog — pasangkan dengan `nbAccent`. */
export const nbDialogHead = 'border-b-4 border-[#111] px-5 py-4'
export const nbDialogIcon =
  'nb-frame nb-frame-thin flex h-9 w-9 shrink-0 items-center justify-center bg-white'
export const nbDialogTitle = 'text-xl font-black uppercase leading-none tracking-tight'
export const nbDialogDesc = 'text-xs font-bold text-[#111]/70'
export const nbDialogBody = 'space-y-5 px-5 py-5'
export const nbDialogFooter = 'gap-2 border-t-4 border-[#111] px-5 py-4'

/* ------------------------------------------------------------ tabel & status */

/** Dipasang lewat prop `className` di `<DataTable>`. */
export const nbTable = 'nb nb-table nb-sd'
/** Dipasang lewat prop `className` di `<Pagination>`. */
export const nbPagination = 'nb nb-pagination'

/** Tag kecil di dalam sel tabel / kartu. Pasangkan dengan `nbAccent`. */
export const nbTag =
  'nb-frame nb-frame-thin inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide'

/** Tag status di sisi kanan judul halaman. Pasangkan dengan `nbAccent`. */
export const nbStatusTag =
  'nb-frame nb-frame-thin nb-sd-sm inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.12em]'

/** Kotak besar untuk keadaan memuat / kosong / gagal. */
export const nbStateBox =
  'nb-frame nb-frame-thick nb-sd flex min-h-[16rem] flex-col items-center justify-center gap-4 bg-white px-6 py-12 text-center'
/** Ikon bulat-persegi di dalam `nbStateBox`. Pasangkan dengan `nbAccent`. */
export const nbStateIcon =
  'nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center'
