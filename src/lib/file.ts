/**
 * Batas dan whitelist unggahan gambar — dijaga tetap sama dengan sisi server
 * (`internal/constants/message.go` dan `internal/utils/validate_image.go`).
 * Kalau FE lebih longgar dari BE, pengguna baru tahu berkasnya ditolak setelah
 * unggahan selesai dan balasan 400 datang.
 */

/** Cermin dari `constants.MaxUploadSize` di backend (2 MiB). */
export const MAX_FILE_SIZE = 2 * 1024 * 1024

/**
 * Cermin dari `allowedImageTypes` di backend. SVG sengaja tidak ada: bucket
 * unggahan bersifat public-read, dan SVG adalah dokumen XML yang bisa memuat
 * skrip.
 */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** Nilai untuk atribut `accept` pada `<input type='file'>`. */
export const ACCEPTED_IMAGE_ACCEPT = ACCEPTED_IMAGE_TYPES.join(',')
