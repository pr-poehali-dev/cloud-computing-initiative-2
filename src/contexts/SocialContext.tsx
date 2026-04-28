import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"

export interface SocialComment {
  id: string
  authorEmail: string
  authorName: string
  text: string
  createdAt: string
}

export interface SocialPost {
  id: string
  authorEmail: string
  authorName: string
  caption: string
  images: string[]
  likes: string[]
  comments: SocialComment[]
  createdAt: string
}

interface SocialContextType {
  posts: SocialPost[]
  createPost: (data: { caption: string; images: string[]; author: { email: string; name: string } }) => void
  deletePost: (id: string, currentEmail: string) => void
  toggleLike: (postId: string, email: string) => void
  addComment: (postId: string, author: { email: string; name: string }, text: string) => void
  deleteComment: (postId: string, commentId: string, currentEmail: string) => void
}

const STORAGE_POSTS = "mojno_social_posts"

const readPosts = (): SocialPost[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_POSTS) || "[]")
  } catch {
    return []
  }
}

const writePosts = (posts: SocialPost[]) => {
  localStorage.setItem(STORAGE_POSTS, JSON.stringify(posts))
}

const seedIfEmpty = (): SocialPost[] => {
  const existing = readPosts()
  if (existing.length > 0) return existing
  const seed: SocialPost[] = [
    {
      id: "seed-1",
      authorEmail: "anna@club.local",
      authorName: "Анна",
      caption: "Вчерашний круг поддержки в «Резиденции» — три часа честных разговоров и тёплых объятий. Спасибо девочкам за этот вечер.",
      images: [
        "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/15422723-dc66-4444-9812-8306f234551a.jpg",
      ],
      likes: ["olga@club.local", "elena@club.local"],
      comments: [
        {
          id: "c-1",
          authorEmail: "olga@club.local",
          authorName: "Ольга",
          text: "Это было волшебно. Уже жду следующую встречу!",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      id: "seed-2",
      authorEmail: "elena@club.local",
      authorName: "Елена",
      caption: "Утренняя йога у воды — лучшее начало субботы.",
      images: [
        "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/1aa5f880-559c-4ec5-838d-659f307e9df8.jpg",
        "https://cdn.poehali.dev/projects/1814992c-f1be-4bc1-a550-62811824f8aa/files/6a8cfa15-cec6-4996-9062-69db8eb29d2f.jpg",
      ],
      likes: ["anna@club.local"],
      comments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    },
  ]
  writePosts(seed)
  return seed
}

const SocialContext = createContext<SocialContextType | null>(null)

export function SocialProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<SocialPost[]>([])

  useEffect(() => {
    setPosts(seedIfEmpty())
  }, [])

  const persist = useCallback((next: SocialPost[]) => {
    writePosts(next)
    setPosts(next)
  }, [])

  const createPost: SocialContextType["createPost"] = ({ caption, images, author }) => {
    const newPost: SocialPost = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      authorEmail: author.email,
      authorName: author.name,
      caption,
      images,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    }
    persist([newPost, ...posts])
  }

  const deletePost: SocialContextType["deletePost"] = (id, currentEmail) => {
    persist(posts.filter((p) => !(p.id === id && p.authorEmail === currentEmail)))
  }

  const toggleLike: SocialContextType["toggleLike"] = (postId, email) => {
    persist(
      posts.map((p) => {
        if (p.id !== postId) return p
        const has = p.likes.includes(email)
        return { ...p, likes: has ? p.likes.filter((e) => e !== email) : [...p.likes, email] }
      })
    )
  }

  const addComment: SocialContextType["addComment"] = (postId, author, text) => {
    persist(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  authorEmail: author.email,
                  authorName: author.name,
                  text,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : p
      )
    )
  }

  const deleteComment: SocialContextType["deleteComment"] = (postId, commentId, currentEmail) => {
    persist(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments.filter(
                (c) => !(c.id === commentId && c.authorEmail === currentEmail)
              ),
            }
          : p
      )
    )
  }

  return (
    <SocialContext.Provider
      value={{ posts, createPost, deletePost, toggleLike, addComment, deleteComment }}
    >
      {children}
    </SocialContext.Provider>
  )
}

export const useSocial = () => {
  const ctx = useContext(SocialContext)
  if (!ctx) throw new Error("useSocial must be used inside SocialProvider")
  return ctx
}
