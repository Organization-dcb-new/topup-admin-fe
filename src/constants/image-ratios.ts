/** Rasio kotak gambar yang HARUS sama dengan cara storefront merendernya.
 *
 *  Dashboard ini memvalidasi lewat mata: admin mengunggah, melihat preview,
 *  lalu menganggap itulah yang dilihat pengunjung. Begitu rasionya berbeda,
 *  preview berubah jadi kebohongan yang meyakinkan. Sudah kejadian dua kali —
 *  keduanya karena rasio ditulis ulang di tiap tempat pemakaian, bukan
 *  dirujuk dari satu tempat.
 *
 *  Angka di komentar tiap konstanta adalah sumber kebenarannya di storefront
 *  (pakargaming-fe). Kalau di sana berubah, ubah di sini juga.
 *
 *  Semuanya ditulis sebagai kelas Tailwind utuh dan bukan dirakit saat runtime:
 *  Tailwind memindai teks kelas literal di berkas sumber, jadi kelas hasil
 *  rangkaian string tidak akan pernah ikut ter-generate. */

/** Banner beranda. Storefront: `bannerDimensions.ts` 1280×400 = 16:5,
 *  dipasang `object-cover` — apa pun di luar 16:5 dipotong. */
export const BANNER_ASPECT = 'aspect-[16/5]'

/** Banner game (`banner_url`), dipakai sebagai cover halaman checkout.
 *  Storefront: `GameTransaction/components/Banner.tsx` 1600×400 = 4:1,
 *  `object-cover`.
 *
 *  Sebelum ini dashboard memakai DUA angka yang bahkan tidak saling cocok —
 *  `aspect-[21/9]` (2.33) di modal unggah dan `aspect-[21/5]` (4.2) di halaman
 *  detail — jadi tak satu pun tempat menunjukkan potongan yang sebenarnya. */
export const GAME_BANNER_ASPECT = 'aspect-[4/1]'

/** Thumbnail game (`thumbnail_url`). Storefront memakainya PERSEGI di hampir
 *  semua tempat: `Home/components/GameTile.tsx` (tile utama),
 *  `GameTransaction/components/Banner.tsx` (120–220px di checkout),
 *  `Navigation/Search.tsx`, dan `GameDetail/Header.tsx` — semuanya
 *  `object-cover`. Satu-satunya pengecualian, `Home/Games.tsx`, memakai 16:9
 *  dengan `object-contain`: tidak memotong, hanya memberi bilah kosong, jadi
 *  gambar persegi tetap aman di sana. */
export const GAME_THUMBNAIL_ASPECT = 'aspect-square'
