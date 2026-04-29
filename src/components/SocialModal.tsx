import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"
import { useSocial, type SocialPost } from "@/contexts/SocialContext"
import { toast } from "sonner"
import TeamBadge from "@/components/TeamBadge"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onRequireAuth?: () => void
}

const formatTime = (iso: string) => {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "только что"
  if (m < 60) return `${m} мин назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч назад`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days} д назад`
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

export default function SocialModal({ open, onOpenChange, onRequireAuth }: Props) {
  const { user, isAuthenticated } = useAuth()
  const { posts, createPost, deletePost, toggleLike, addComment, deleteComment } = useSocial()
  const fileRef = useRef<HTMLInputElement>(null)

  const [caption, setCaption] = useState("")
  const [draftImages, setDraftImages] = useState<string[]>([])
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})

  const myEmail = user?.email || ""
  const myName = user ? `${user.firstName} ${user.lastName}`.trim() : ""
  const myRole = user?.role
  const myPosition = user?.teamPosition
  const isTeam = myRole === "team"

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Войдите в клуб, чтобы делиться постами")
      onOpenChange(false)
      onRequireAuth?.()
      return false
    }
    return true
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (!requireAuth()) return
    const arr = Array.from(files).slice(0, 4 - draftImages.length)
    arr.forEach((f) => {
      const reader = new FileReader()
      reader.onload = () => {
        setDraftImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(f)
    })
  }

  const removeDraftImage = (i: number) =>
    setDraftImages((prev) => prev.filter((_, idx) => idx !== i))

  const handlePublish = () => {
    if (!requireAuth()) return
    if (!caption.trim() && draftImages.length === 0) {
      toast.error("Добавь фото или текст")
      return
    }
    createPost({
      caption: caption.trim(),
      images: draftImages,
      author: { email: myEmail, name: myName || "Гостья", role: myRole, position: myPosition },
    })
    setCaption("")
    setDraftImages([])
    toast.success("Опубликовано!")
  }

  const handleLike = (post: SocialPost) => {
    if (!requireAuth()) return
    toggleLike(post.id, myEmail)
  }

  const handleAddComment = (postId: string) => {
    if (!requireAuth()) return
    const text = (commentDrafts[postId] || "").trim()
    if (!text) return
    addComment(
      postId,
      { email: myEmail, name: myName || "Гостья", role: myRole, position: myPosition },
      text
    )
    setCommentDrafts((d) => ({ ...d, [postId]: "" }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/5">
          <DialogTitle
            className="text-2xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Соц.сеть «МОЖНО»
          </DialogTitle>
          <DialogDescription className="text-xs uppercase tracking-[0.22em] text-pink-600">
            Делитесь фото со встреч и общайтесь
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          {/* Composer */}
          {isAuthenticated ? (
            <div className="px-6 py-5 border-b border-black/5 bg-pink-50/40">
              <div className="flex items-start gap-3">
                <div
                  className={`relative w-10 h-10 rounded-full text-white flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    isTeam
                      ? "bg-gradient-to-br from-amber-400 via-pink-500 to-fuchsia-600 ring-2 ring-amber-300"
                      : "bg-gradient-to-br from-pink-400 to-rose-500"
                  }`}
                >
                  {initials(myName) || "Я"}
                  {isTeam && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-white flex items-center justify-center border-2 border-white">
                      <Icon name="Crown" size={8} />
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Расскажи, как прошла встреча..."
                    className="min-h-[70px] resize-none border-black/10 bg-white"
                  />
                  {draftImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {draftImages.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeDraftImage(i)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                          >
                            <Icon name="X" size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={draftImages.length >= 4}
                      className="inline-flex items-center gap-2 text-xs text-pink-600 hover:text-pink-700 disabled:opacity-40 uppercase tracking-[0.18em]"
                    >
                      <Icon name="ImagePlus" size={16} />
                      Фото {draftImages.length > 0 && `(${draftImages.length}/4)`}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(e) => {
                        handleFiles(e.target.files)
                        if (fileRef.current) fileRef.current.value = ""
                      }}
                    />
                    <button
                      onClick={handlePublish}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xs uppercase tracking-[0.2em] transition-colors"
                    >
                      <Icon name="Send" size={14} />
                      Опубликовать
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-5 border-b border-black/5 bg-pink-50/40 text-sm text-black/70 text-center">
              Войдите в клуб, чтобы публиковать фото и оставлять комментарии.
            </div>
          )}

          {/* Feed */}
          <div className="px-6 py-5 space-y-6">
            {posts.length === 0 && (
              <div className="text-center text-sm text-black/50 py-12">
                Пока никто не делился. Будь первой!
              </div>
            )}

            {posts.map((post) => {
              const liked = post.likes.includes(myEmail)
              const isOwn = post.authorEmail === myEmail
              return (
                <article
                  key={post.id}
                  className="rounded-2xl border border-black/5 bg-white overflow-hidden"
                >
                  <div className="px-5 pt-4 pb-3 flex items-center gap-3">
                    <div
                      className={`relative w-10 h-10 rounded-full text-white flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                        post.authorRole === "team"
                          ? "bg-gradient-to-br from-amber-400 via-pink-500 to-fuchsia-600 ring-2 ring-amber-300"
                          : "bg-gradient-to-br from-pink-400 to-rose-500"
                      }`}
                    >
                      {initials(post.authorName) || "?"}
                      {post.authorRole === "team" && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-white flex items-center justify-center border-2 border-white">
                          <Icon name="Crown" size={8} />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="text-sm font-medium truncate">{post.authorName}</div>
                        {post.authorRole === "team" && (
                          <TeamBadge withLabel position={post.authorPosition || "Команда клуба"} />
                        )}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-black/45">
                        {formatTime(post.createdAt)}
                      </div>
                    </div>
                    {isOwn && (
                      <button
                        onClick={() => deletePost(post.id, myEmail)}
                        className="text-black/40 hover:text-red-500 transition-colors"
                        title="Удалить"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    )}
                  </div>

                  {post.caption && (
                    <p className="px-5 pb-3 text-sm text-black/80 leading-relaxed whitespace-pre-wrap">
                      {post.caption}
                    </p>
                  )}

                  {post.images.length > 0 && (
                    <div
                      className={`grid gap-1 ${
                        post.images.length === 1
                          ? "grid-cols-1"
                          : post.images.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-2"
                      }`}
                    >
                      {post.images.map((src, i) => (
                        <div
                          key={i}
                          className={`bg-black/5 ${
                            post.images.length >= 3 && i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"
                          } overflow-hidden`}
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="px-5 py-3 flex items-center gap-5 border-t border-black/5">
                    <button
                      onClick={() => handleLike(post)}
                      className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
                        liked ? "text-pink-600" : "text-black/60 hover:text-pink-600"
                      }`}
                    >
                      <Icon name={liked ? "Heart" : "Heart"} size={18} />
                      {post.likes.length > 0 && <span>{post.likes.length}</span>}
                    </button>
                    <div className="inline-flex items-center gap-1.5 text-sm text-black/60">
                      <Icon name="MessageCircle" size={18} />
                      {post.comments.length > 0 && <span>{post.comments.length}</span>}
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="px-5 pb-4 space-y-3">
                    {post.comments.map((c) => (
                      <div key={c.id} className="flex items-start gap-2.5">
                        <div
                          className={`relative w-8 h-8 rounded-full text-white flex items-center justify-center text-[10px] font-medium flex-shrink-0 ${
                            c.authorRole === "team"
                              ? "bg-gradient-to-br from-amber-400 via-pink-500 to-fuchsia-600 ring-1 ring-amber-300"
                              : "bg-gradient-to-br from-pink-300 to-rose-400"
                          }`}
                        >
                          {initials(c.authorName) || "?"}
                          {c.authorRole === "team" && (
                            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-white flex items-center justify-center border border-white">
                              <Icon name="Crown" size={7} />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 bg-black/[0.03] rounded-2xl px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                              <div className="text-xs font-medium truncate">{c.authorName}</div>
                              {c.authorRole === "team" && (
                                <TeamBadge withLabel position={c.authorPosition || "Команда клуба"} />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-black/45">{formatTime(c.createdAt)}</span>
                              {c.authorEmail === myEmail && (
                                <button
                                  onClick={() => deleteComment(post.id, c.id, myEmail)}
                                  className="text-black/30 hover:text-red-500"
                                  title="Удалить"
                                >
                                  <Icon name="X" size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-black/80 mt-0.5 break-words">{c.text}</p>
                        </div>
                      </div>
                    ))}

                    {isAuthenticated && (
                      <div className="flex items-center gap-2 pt-1">
                        <Input
                          value={commentDrafts[post.id] || ""}
                          onChange={(e) =>
                            setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleAddComment(post.id)
                            }
                          }}
                          placeholder="Написать комментарий..."
                          className="h-9 text-sm bg-black/[0.03] border-transparent focus-visible:bg-white"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="w-9 h-9 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center flex-shrink-0"
                        >
                          <Icon name="ArrowUp" size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}