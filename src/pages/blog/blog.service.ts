import { Post } from '@/types/blog.type'
import { CustomError } from '@/utils/helpers'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const blogApi = createApi({
  reducerPath: 'blogApi', // tên field trong Redux state
  tagTypes: ['Posts'], // những kiểu tag cho phép dùng trong blogAPI
  keepUnusedDataFor: 50,
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3004',
    prepareHeaders(headers) {
      headers.set('authorization', 'Bearer ABCXYZ')

      return headers
    },
  }),
  endpoints: (build) => ({
    // Generic type theo thứ tự là kiểu response trả về và argument
    getPosts: build.query<Post[], void>({
      query: () => '/posts', // method không có argument
      /**
       * providesTags có thể là array hoặc callback return array
       * Nếu có bất kỳ một invalidatesTag nào match với providesTags này thì sẽ làm cho getPosts method chạy lại và cập nhật lại danh sách các bài post cũng như các tags phía dưới
       */
      providesTags(result) {
        /**
         * Cái callback này sẽ chạy mỗi khi getPosts chạy. Mong muốn là sẽ return về một mảng kiểu như sau:
         * ```ts
         * interface Tags: {
         *   type: "Posts";
         *   id: string;
         * }[]
         * ```
         * Vì thế thêm as const vào để báo hiệu type là Read only, không thể mutate
         */
        if (result) {
          const final = [
            ...result.map(({ id }) => ({ type: 'Posts' as const, id })),
            { type: 'Posts' as const, id: 'LIST' },
          ]
          return final
        }
        const final = [{ type: 'Posts' as const, id: 'LIST' }]
        return final
      },
    }),
    getPost: build.query<Post, string>({
      query: (id) => ({
        url: `/posts/${id}`,
        headers: {
          hello: "I'm Duoc",
        },
        params: {
          first_name: 'du',
          last_name: 'duoc',
        },
      }),
    }),

    /**
     * Chúng ta dùng mutation đối với các trường hợp POST, PUT, DELETE
     * Post là response trả về và Omit<Post, 'id'> là body gửi lên
     */
    addPost: build.mutation<Post, Omit<Post, 'id'>>({
      query(body) {
        try {
          // throw Error('hmm')
          // const a: any = null
          // a.b = 1
          return {
            url: '/posts',
            method: 'POST',
            body,
          }
        } catch (error: any) {
          throw new CustomError(error.message)
        }
      },
      /**
       * invalidatesTags cung cấp các tag để báo hiệu cho những method nào có providesTags match với nó sẽ bị gọi lại.
       * Trong những trường hợp này getPosts match nên sẽ gọi lại.
       */
      invalidatesTags: (_result, error) => (error ? [] : [{ type: 'Posts', id: 'LIST' }]),
    }),
    updatePost: build.mutation<Post, { id: string; body: Post }>({
      query(data) {
        return {
          url: `/posts/${data.id}`,
          method: 'PUT',
          body: data.body,
        }
      },
      // Trong trường hợp này thì getPosts sẽ được gọi lại
      invalidatesTags: (_result, error, data) => (error ? [] : [{ type: 'Posts', id: data.id }]),
    }),
    deletePost: build.mutation<object, string>({
      query(id) {
        return {
          url: `/posts/${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (_result, _error, id) => [{ type: 'Posts', id }],
    }),
  }),
})

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useAddPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = blogApi
