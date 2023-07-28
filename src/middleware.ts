import {
  AnyAction,
  Middleware,
  MiddlewareAPI,
  isRejected,
  isRejectedWithValue,
} from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

function isPayloadErrorMessage(payload: unknown): payload is {
  data: {
    error: string
  }
  status: number
} {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    typeof (payload as any).data?.error === 'string'
  )
}

export const rtkQueryErrorLogger: Middleware =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_api: MiddlewareAPI) => (next) => (action: AnyAction) => {
    /**
     * `isRejectedWithValue` là một function giúp chúng ta kiểm tra những action có rejectedWithValue = true từ createAsyncThunk
     * RTK Query sử dụng `createAsyncThunk` bên trong nên chúng ta có thể dùng `isRejectedWithValue` để kiểm tra lỗi 🎉
     */
    if (isRejected(action)) {
      if (action.error.name === 'CustomError') {
        // Những lỗi liên quan đến quá trình thực thi
        toast.warn(action.error.message)
      }
      // if (!isEntityError(action.payload)) {
      // Các lỗi còn lại trừ lỗi 422: Có thể là từ SerializeError
      // toast.warn(action.error.message)
      // }
    }

    if (isRejectedWithValue(action)) {
      // Mỗi khi thực hiện query hoặc mutation mà bị lỗi thì nó sẽ chạy vào đây
      // Những lỗi từ server thì action nó mới có rejectedWithValue = true
      // Còn những action liên quan đến việc caching mà bị rejected thì rejectedWithValue = false nên đừng lo lắng nó không lọt vào đây được
      if (isPayloadErrorMessage(action.payload)) {
        // Lỗi reject từ server chỉ có message thôi
        toast.warn(action.payload.data.error)
      }
    }

    return next(action)
  }
