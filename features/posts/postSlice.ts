import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

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

const initialState: PostState = {
  posts: [],
}

export const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.push(action.payload)
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload)
    },
    updatePost: (state, action: PayloadAction<Partial<Post> & { id: string }>) => {
      state.posts = state.posts.map((post) => {
        if (post.id === action.payload.id) {
          return {
            ...post,
            ...action.payload,
          }
        }
        return post
      })
    },
  },
})

export const { addPost, deletePost, updatePost } = postSlice.actions

export default postSlice.reducer