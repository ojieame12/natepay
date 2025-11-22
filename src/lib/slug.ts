const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function generateSlug(length = 8) {
  let slug = '';
  for (let i = 0; i < length; i += 1) {
    slug += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return slug;
}
