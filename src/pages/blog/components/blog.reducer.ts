import { createAction, createReducer, current, nanoid } from '@reduxjs/toolkit'
import { initalPostList } from '@/constants/blog'
import { Post } from '@/types/blog.type'

interface BlogState {
  postList: Post[]
  editingPost: Post | null
}

const initalState: BlogState = {
  postList: initalPostList,
  editingPost: null,
}

export const addPost = createAction('blog/addPost', (post: Omit<Post, 'id'>) => {
  return {
    payload: {
      ...post,
      id: nanoid(),
    },
  }
})
export const deletePost = createAction<string>('blog/deletePost')
export const startEditingPost = createAction<string>('blog/startEditingPost')
export const cancelEditingPost = createAction('blog/cancelEditingPost')
export const finishEditingPost = createAction<Post>('blog/finishEditingPost')

const blogReducer = createReducer(initalState, (builder) => {
  builder
    .addCase(addPost, (state, action) => {
      state.postList.push(action.payload)
    })
    .addCase(deletePost, (state, action) => {
      const postId = action.payload
      const foundPostIndex = state.postList.findIndex((postItem) => postItem.id === postId)
      if (foundPostIndex >= 0) {
        state.postList.splice(foundPostIndex, 1)
      }
    })
    .addCase(startEditingPost, (state, action) => {
      const postId = action.payload
      const foundPost = state.postList.find((postItem) => postItem.id === postId) || null

      state.editingPost = foundPost
    })
    .addCase(cancelEditingPost, (state) => {
      state.editingPost = null
    })
    .addCase(finishEditingPost, (state, action) => {
      const postId = action.payload.id
      state.postList.some((postItem, index) => {
        if (postItem.id === postId) {
          state.postList[index] = action.payload
          return true
        }
        return false
      })
    })
    .addMatcher(
      (action) => action.type.includes('cancel'),
      (state) => {
        console.log(current(state))
      }
    )
})

export default blogReducer
