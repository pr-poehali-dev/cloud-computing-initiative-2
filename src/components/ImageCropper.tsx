import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Icon from "@/components/ui/icon"

interface Props {
  open: boolean
  src: string | null
  onCancel: () => void
  onCrop: (dataUrl: string) => void
  outputSize?: number
  outputQuality?: number
}

export default function ImageCropper({
  open,
  src,
  onCancel,
  onCrop,
  outputSize = 256,
  outputQuality = 0.88,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [imgSize, setImgSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 })
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  })
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  // Размер квадратной рамки кадра (CSS пиксели)
  const cropSize = Math.min(containerSize.w, containerSize.h) * 0.85

  // Перерасчёт при загрузке картинки/контейнера
  useEffect(() => {
    if (!open) return
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setContainerSize({ w: rect.width, h: rect.height })
  }, [open, src])

  const onImgLoad = () => {
    const el = imgRef.current
    if (!el) return
    const w = el.naturalWidth
    const h = el.naturalHeight
    setImgSize({ w, h })
    // Центрируем — стартовый zoom такой, чтобы фото покрывало рамку
    const minSide = Math.min(w, h)
    const target = cropSize || 200
    const baseZoom = target / minSide
    setZoom(baseZoom)
    setPos({ x: 0, y: 0 })
  }

  const onMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y }
  }
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    dragStart.current = { x: t.clientX, y: t.clientY, ox: pos.x, oy: pos.y }
  }

  useEffect(() => {
    const move = (clientX: number, clientY: number) => {
      if (!dragStart.current) return
      const dx = clientX - dragStart.current.x
      const dy = clientY - dragStart.current.y
      setPos({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy })
    }
    const onMM = (e: MouseEvent) => move(e.clientX, e.clientY)
    const onTM = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) move(t.clientX, t.clientY)
    }
    const onUp = () => {
      dragStart.current = null
    }
    window.addEventListener("mousemove", onMM)
    window.addEventListener("mouseup", onUp)
    window.addEventListener("touchmove", onTM)
    window.addEventListener("touchend", onUp)
    return () => {
      window.removeEventListener("mousemove", onMM)
      window.removeEventListener("mouseup", onUp)
      window.removeEventListener("touchmove", onTM)
      window.removeEventListener("touchend", onUp)
    }
  }, [])

  const handleCrop = () => {
    if (!imgSize.w || !cropSize) return
    // Размер изображения на экране в CSS px при текущем zoom
    const screenW = imgSize.w * zoom
    const screenH = imgSize.h * zoom
    // Центр контейнера
    const cx = containerSize.w / 2
    const cy = containerSize.h / 2
    // Левый-верхний угол изображения на экране
    const imgLeft = cx + pos.x - screenW / 2
    const imgTop = cy + pos.y - screenH / 2
    // Левый-верхний угол рамки кадра
    const cropLeft = cx - cropSize / 2
    const cropTop = cy - cropSize / 2
    // Координаты рамки относительно изображения (в CSS px)
    const relX = cropLeft - imgLeft
    const relY = cropTop - imgTop
    // Переводим в исходные пиксели изображения
    const sx = relX / zoom
    const sy = relY / zoom
    const sSize = cropSize / zoom

    const canvas = document.createElement("canvas")
    canvas.width = outputSize
    canvas.height = outputSize
    const ctx = canvas.getContext("2d")
    const el = imgRef.current
    if (!ctx || !el) return
    // Рисуем выбранную область
    ctx.drawImage(el, sx, sy, sSize, sSize, 0, 0, outputSize, outputSize)
    const dataUrl = canvas.toDataURL("image/jpeg", outputQuality)
    onCrop(dataUrl)
  }

  // Минимальный/максимальный zoom
  const minSide = Math.min(imgSize.w, imgSize.h) || 1
  const minZoom = (cropSize || 1) / minSide
  const maxZoom = minZoom * 5

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-4 pb-2 border-b border-black/5">
          <DialogTitle className="text-base flex items-center gap-2">
            <Icon name="Crop" size={15} className="text-pink-600" />
            Кадрировать фото
          </DialogTitle>
          <DialogDescription className="text-xs">
            Перетаскивай снимок и регулируй масштаб — выделенная область станет
            иконкой
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pt-3 pb-4 space-y-3">
          <div
            ref={containerRef}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            className="relative w-full h-[320px] bg-stone-900 rounded-2xl overflow-hidden cursor-move select-none touch-none"
          >
            {src && (
              <img
                ref={imgRef}
                src={src}
                alt="Кадр"
                onLoad={onImgLoad}
                draggable={false}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: imgSize.w * zoom,
                  height: imgSize.h * zoom,
                  transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
                  pointerEvents: "none",
                  maxWidth: "none",
                }}
              />
            )}
            {/* Затемнение и рамка */}
            {cropSize > 0 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: `0 0 0 9999px rgba(0,0,0,0.55)`,
                  borderRadius: "0",
                  width: cropSize,
                  height: cropSize,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="absolute inset-0 border-2 border-white/90 rounded-xl" />
                {/* Сетка третей */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Icon name="ZoomOut" size={14} className="text-black/45" />
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={0.001}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-pink-600"
            />
            <Icon name="ZoomIn" size={14} className="text-black/45" />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-black/55">
            <Icon name="Move" size={12} />
            Перетаскивай мышью или пальцем · ползунок меняет масштаб
          </div>
        </div>

        <div className="flex gap-2 px-5 py-3 border-t border-black/5 bg-white">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-full border border-black/15 text-xs uppercase tracking-[0.2em] hover:bg-black/5"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-pink-600 text-white text-xs uppercase tracking-[0.2em] hover:bg-pink-700"
          >
            <Icon name="Check" size={13} />
            Применить кадр
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}