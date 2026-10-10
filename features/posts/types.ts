export interface Post {
  id: string
  title: string
  content: string
  author: string
  avatarUrl?: string
  imageUrl?: string
  likes?: string
  comments?: string
  liked?: boolean
  createdAt: string
  updatedAt: string
}

export interface PostState {
  posts: Post[]
}