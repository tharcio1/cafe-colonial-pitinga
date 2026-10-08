import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

await mkdir('public/images', { recursive: true })
await Promise.all(['site1', 'site2', 'site3'].flatMap(name =>
  [480, 800, 1254].map(width => sharp(`imgs/${name}.jpg`)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`public/images/${name}-${width}.webp`))
))
console.log('Imagens WebP responsivas geradas; originais preservados em imgs/.')
