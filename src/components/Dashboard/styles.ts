// Token kartu dashboard, versi neo-brutalism.
// - `dashCard` menetralkan padding default `Card` (`py-6` + `gap-6`) yang boros
//   ruang, lalu menimpa border/radius/shadow bawaan lewat kelas `.nb-*`
//   (unlayered, jadi menang atas utility Tailwind — lihat src/styles/style.css).
// - `dashCardHeader` sengaja tidak menentukan warna latar: tiap kartu memilih
//   aksennya sendiri supaya antar-blok gampang dibedakan sekilas.
export const dashCard = 'nb-frame nb-frame-thick nb-sd gap-0 bg-white py-0'
export const dashCardHeader = 'border-b-4 border-[#111] px-4 py-3'
export const dashCardTitle = 'text-sm font-black uppercase tracking-tight text-[#111]'
export const dashCardBody = 'p-4'

/** Aksen kepala kartu. Dipakai berpasangan dengan `dashCardHeader`. */
export const dashAccent = {
  lime: 'bg-[#c9f24d]',
  cyan: 'bg-[#6fe3f5]',
  pink: 'bg-[#ff9ed2]',
  orange: 'bg-[#ff9d3d]',
  yellow: 'bg-[#ffd84d]',
  red: 'bg-[#ff4d3d]',
} as const

/**
 * Kelas untuk `Select` shadcn di dashboard. `SelectContent` dirender lewat
 * portal di luar pembungkus `.nb`, jadi butuh kelas `nb` sendiri supaya
 * variabel `--nb-ink` (dipakai `.nb-frame`/`.nb-sd`) tetap terbaca.
 */
export const dashSelectTrigger =
  'nb-frame nb-frame-thin nb-sd-sm nb-focus bg-white font-bold text-[#111] focus-visible:ring-0'
export const dashSelectContent = 'nb nb-frame nb-frame-thin nb-sd bg-white'
export const dashSelectItem =
  'rounded-none font-bold text-[#111] focus:bg-[#ffd84d] focus:text-[#111]'
