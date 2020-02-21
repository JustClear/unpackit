#!/usr/bin/env node

'use strict'
// process.cwd() 命令行目录
const fs = require('fs')
const path = require('path')
const command = require('commander')
const { createCanvas, loadImage: LoadImage } = require('canvas')

command.option('-n, --name <string>', 'git')
command.parse(process.argv)

async function main() {
    if (command.name && typeof command !== 'function') {
        const JSON_PATH = path.resolve(process.cwd(), command.name)
        if (fs.existsSync(JSON_PATH)) {
            const JSON_DATA = require(JSON_PATH)
            const IMAGE_PATH = path.resolve(process.cwd(), JSON_DATA.meta.image)
            const [imageName] = JSON_DATA.meta.image.split('.')
            if (!fs.existsSync(`${process.cwd()}/${imageName}`)) fs.mkdirSync(`${process.cwd()}/${imageName}`)
            if (fs.existsSync(IMAGE_PATH)) {
                const image = await LoadImage(IMAGE_PATH)
                for (const key in JSON_DATA.frames) {
                    if (JSON_DATA.frames.hasOwnProperty(key)) {
                        const item = JSON_DATA.frames[key];
                        const { frame, sourceSize, rotated } = item
                        const canvas = createCanvas(sourceSize.w, sourceSize.h)
                        const ctx = canvas.getContext('2d')
                        ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, 0, 0, sourceSize.w, sourceSize.h)
                        const out = fs.createWriteStream(`${process.cwd()}/${imageName}/${key}.png`)
                        const stream = canvas.createPNGStream()
                        stream.pipe(out)
                        out.on('finish', () => console.log(`${key}.png was created.`))
                    }
                }
            } else {
                console.log('PNG 不存在')
                process.exit()
            }
        } else {
            console.log('JSON 文件不存在')
            process.exit()
        }
    }
}

main()