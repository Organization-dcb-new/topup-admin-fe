/** Upload limit enforced by the backend (topup-be `constants.MaxUploadSize`); keep them equal. */
export const MAX_FILE_SIZE = 2 * 1024 * 1024
/** MAX_FILE_SIZE as shown to people. */
export const MAX_FILE_SIZE_LABEL = '2 MB'
/** Image types the backend accepts (topup-be `utils.ValidateImage`). */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
