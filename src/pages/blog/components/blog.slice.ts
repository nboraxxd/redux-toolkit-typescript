import { current, nanoid, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initalPostList } from '@/constants/blog'
import { Post } from '@/types/blog.type'

interface BlogState {
  postList: Post[]
  editingPost: Post | null
}

const initialState: BlogState = {
  postList: initalPostList,
  editingPost: null,
}

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    deletePost: (state, action: PayloadAction<string>) => {
      const postId = action.payload
      const foundPostIndex = state.postList.findIndex((postItem) => postItem.id === postId)
      if (foundPostIndex >= 0) {
        state.postList.splice(foundPostIndex, 1)
      }
    },
    startEditingPost: (state, action: PayloadAction<string>) => {
      const postId = action.payload
      const foundPost = state.postList.find((postItem) => postItem.id === postId) || null

      state.editingPost = foundPost
    },
    cancelEditingPost: (state) => {
      state.editingPost = null
    },
    finishEditingPost: (state, action: PayloadAction<Post>) => {
      const postId = action.payload.id
      state.postList.some((postItem, index) => {
        if (postItem.id === postId) {
          state.postList[index] = action.payload
          return true
        }
        return false
      })
    },
    addPost: {
      reducer: (state, action: PayloadAction<Post>) => {
        state.postList.push(action.payload)
      },
      prepare: (post: Omit<Post, 'id'>) => ({
        payload: {
          ...post,
          id: nanoid(),
        },
      }),
    },
  },
  extraReducers(builder) {
    builder
      .addMatcher(
        (action) => action.type.includes('cancel'),
        (state) => {
          console.log(current(state))
        }
      )
      .addDefaultCase((state) => {
        return current(state)
      })
  },
})

export const { addPost, deletePost, startEditingPost, cancelEditingPost, finishEditingPost } =
  blogSlice.actions

const blogReducer = blogSlice.reducer
export default blogReducer
