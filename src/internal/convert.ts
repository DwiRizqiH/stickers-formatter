import sharp from 'sharp'
import { writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import videoToGif from './videoToGif.js'
import crop from './crop.js'
import { StickerTypes } from './Metadata/StickerTypes.js'
import { defaultBg } from '../Utils.js'
import { IStickerOptions } from '../Types.js'

const convert = async (
    data: Buffer,
    mime: string,
    { quality = 100, background = defaultBg, type = StickerTypes.DEFAULT }: IStickerOptions
): Promise<Buffer> => {
    const isVideo = mime.startsWith('video')
    let image = isVideo ? await videoToGif(data) : data
    const isAnimated = isVideo || mime.includes('gif') || mime.includes('webp')

    if (isAnimated && ['crop', 'circle', 'rounded'].includes(type)) {
        const filename = `${tmpdir()}/${Math.random().toString(36)}.webp`
        await writeFile(filename, image)
        image = await crop(filename)
        type =
            type === StickerTypes.CIRCLE
                ? StickerTypes.CIRCLE
                : type === StickerTypes.ROUNDED
                ? StickerTypes.ROUNDED
                : StickerTypes.DEFAULT
    }

    const img = sharp(image, { animated: isAnimated }).toFormat('webp')

    switch (type) {
        case StickerTypes.CROPPED:
            img.resize(512, 512, { fit: sharp.fit.cover })
            break

        case StickerTypes.FULL:
            img.resize(512, 512, { fit: sharp.fit.contain, background })
            break

        case StickerTypes.CIRCLE:
            img.resize(512, 512, { fit: sharp.fit.cover }).composite([
                {
                    input: Buffer.from(
                        `<svg width="512" height="512"><circle cx="256" cy="256" r="256" fill="${background}"/></svg>`
                    ),
                    blend: 'dest-in',
                    gravity: 'northeast',
                    tile: true
                }
            ])
            break

        case StickerTypes.ROUNDED:
            img.resize(512, 512, { fit: sharp.fit.cover }).composite([
                {
                    input: Buffer.from(
                        `<svg width="512" height="512"><rect rx="50" ry="50" width="512" height="512" fill="${background}"/></svg>`
                    ),
                    blend: 'dest-in',
                    gravity: 'northeast',
                    tile: true
                }
            ])
            break
    }

    return img.webp({ quality, lossless: false }).toBuffer()
}

export default convert
