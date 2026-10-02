const COLS = ['pink', 'coral', 'teal']

export const createDocumentImage = (width: number, height: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')!

    // ctx.beginPath()
    // ctx.moveTo(0, 0)
    // ctx.lineTo(Math.random() * width, Math.random() * height * 0.2)
    // ctx.lineTo(width, 0)
    // ctx.lineTo(width - Math.random() * width * 0.2, Math.random() * height)
    // ctx.lineTo(width, height)
    // ctx.lineTo(Math.random() * width, height - Math.random() * height * 0.2)
    // ctx.lineTo(0, height)
    // ctx.lineTo(Math.random() * width * 0.2, Math.random() * height)
    // ctx.lineTo(0, 0)
    // ctx.clip()

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)

    ctx.lineWidth = 4

    for (let i = 0; i < 30; i++) {
        ctx.strokeStyle = COLS[Math.floor(Math.random() * COLS.length)]
        const x1 = Math.random() * width
        const y1 = Math.random() * height
        const x2 = Math.random() * width
        const y2 = Math.random() * height
        
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
    }

    return canvas
}
