import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import classNames from 'classnames'
import { Post } from '@/types/blog.type'
import { cancelEditPost } from '@/pages/blog/blog.slice'
import { isEntityError } from '@/utils/helpers'
import { RootState } from '@/store'
import {
  useAddPostMutation,
  useGetPostQuery,
  useUpdatePostMutation,
} from '@/pages/blog/blog.service'

const initialState: Omit<Post, 'id'> = {
  title: '',
  description: '',
  featuredImage: '',
  publishDate: '',
  published: false,
}

type FormError =
  | {
      // [key in keyof Omit<Post, 'id'>]: string
      [key in keyof typeof initialState]: string
    }
  | null

const CreatePost = () => {
  const [formData, setFormData] = useState<Omit<Post, 'id'> | Post>(initialState)
  const [addPost, addPostResult] = useAddPostMutation()
  const [updatePost, updatePostResult] = useUpdatePostMutation()
  const { postId } = useSelector((state: RootState) => state.blog)
  const { data: dataToUpdate } = useGetPostQuery(postId, { skip: !postId })
  const dispatch = useDispatch()

  /**
   * Lỗi có thể đến từ `addPostResult` hoặc `updatePostResult`
   * Vậy chúng ta sẽ dựa vào điều kiện có dataToUpdate hoặc không có (tức đang trong chế độ edit hay không) để show lỗi
   * Chúng ta cũng không cần thiết phải tạo một state errorForm vì errorForm phụ thuộc vào `addPostResult`, `updatePostResult` và `postId` nên có thể dùng một biến để tính toán
   */

  const errorForm: FormError = useMemo(() => {
    const errorResult = dataToUpdate ? updatePostResult.error : addPostResult.error
    // Vì errorResult có thể là FetchBaseQueryError | SerializedError | undefined, mỗi kiểu lại có cấu trúc khác nhau nên chúng ta cần kiểm tra để hiển thị cho đúng
    if (isEntityError(errorResult)) {
      // Có thể ép kiểu một cách an toàn chỗ này vì chúng ta đã kiểm tra chắc chắn rồi
      // Nếu không muốn ép kiểu thì có thể khai báo cái interface `EntityError` sao cho data.error tương đồng với FormError là được
      return errorResult.data.error as FormError
    }

    return null
  }, [dataToUpdate, addPostResult, updatePostResult])

  useEffect(() => {
    if (dataToUpdate) {
      setFormData(dataToUpdate)
    }
  }, [dataToUpdate])

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()

    try {
      if (dataToUpdate && postId) await updatePost({ body: formData as Post, id: postId }).unwrap()
      else await addPost(formData).unwrap()

      setFormData(initialState)
    } catch (error) {
      console.log(error)
    }
  }

  const cancelEdit = () => {
    dispatch(cancelEditPost())
    setFormData(initialState)
  }

  return (
    <form onSubmit={handleSubmit} onReset={cancelEdit}>
      <div className="mb-6">
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Title"
          required
          value={formData.title}
          onChange={(ev) => setFormData((prev) => ({ ...prev, title: ev.target.value }))}
        />
      </div>
      <div className="mb-6">
        <label
          htmlFor="featuredImage"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          Featured Image
        </label>
        <input
          type="text"
          id="featuredImage"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="URL image"
          required
          value={formData.featuredImage}
          onChange={(ev) => setFormData((prev) => ({ ...prev, featuredImage: ev.target.value }))}
        />
      </div>
      <div className="mb-6">
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-400"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Your description..."
            required
            value={formData.description}
            onChange={(ev) => setFormData((prev) => ({ ...prev, description: ev.target.value }))}
          />
        </div>
      </div>
      <div className="mb-6">
        <label
          htmlFor="publishDate"
          className={classNames('block mb-2 dark:text-gray-300 font-medium text-sm', {
            'text-gray-900': !errorForm?.publishDate,
            'text-red-700': errorForm?.publishDate,
          })}
        >
          Publish Date
        </label>
        <input
          type="datetime-local"
          id="publishDate"
          className={classNames('block w-56 p-2.5 border rounded-lg text-sm focus:outline-none', {
            'border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500':
              !errorForm?.publishDate,
            'border-red-300 bg-red-50 text-red-600 focus:border-red-500 focus:ring-red-500':
              errorForm?.publishDate,
          })}
          required
          value={formData.publishDate}
          onChange={(ev) => setFormData((prev) => ({ ...prev, publishDate: ev.target.value }))}
        />
        {errorForm?.publishDate && (
          <p className="mt-2 text-red-600 text-xs">{errorForm?.publishDate}</p>
        )}
      </div>
      <div className="mb-6 flex items-center">
        <input
          id="publish"
          type="checkbox"
          className="h-4 w-4 focus:ring-2 focus:ring-blue-500"
          checked={formData.published}
          onChange={(ev) => setFormData((prev) => ({ ...prev, published: ev.target.checked }))}
        />
        <label htmlFor="publish" className="ml-2 text-sm font-medium text-gray-900">
          Publish
        </label>
      </div>
      <div>
        {(!dataToUpdate || !postId) && (
          <button
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 group-hover:from-purple-600 group-hover:to-blue-500 dark:text-white dark:focus:ring-blue-800"
            type="submit"
          >
            <span className="relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900">
              Publish Post
            </span>
          </button>
        )}
        {dataToUpdate && postId && (
          <>
            <button
              type="submit"
              className="group relative mb-2 mr-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-teal-300 to-lime-300 p-0.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-lime-200 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 dark:focus:ring-lime-800"
            >
              <span className="relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900">
                Update Post
              </span>
            </button>
            <button
              type="reset"
              className="group relative mb-2 mr-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 p-0.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-100 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 dark:focus:ring-red-400"
            >
              <span className="relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900">
                Cancel
              </span>
            </button>
          </>
        )}
      </div>
    </form>
  )
}

export default CreatePost
