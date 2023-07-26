import classNames from 'classnames'
import { createPortal } from 'react-dom'

interface ConfirmPostType {
  visibleConfirm: boolean
  confirm: () => void
  cancel: () => void
}
const ConfirmPost = ({ visibleConfirm, confirm, cancel }: ConfirmPostType) => {
  return createPortal(
    <div className={classNames('fixed z-[1200] inset-0', { invisible: !visibleConfirm })}>
      {/* "fixed invisible z-[1200] inset-0" */}
      <div className="fixed flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-[-1] opacity-100 transition-opacity duration-[225ms] ease-in-out delay-[0ms] inset-0"></div>
      <div className="h-full flex justify-center items-center opacity-100 outline-0 transition-opacity duration-[225ms] ease-in-out delay-[0ms]">
        <div className="p-8 rounded-[5px] bg-white">
          <p className="text-center mb-8">Are you sure you want to delete this post?</p>
          <button
            className="mx-8 my-0 px-8 py-4 rounded-md bg-blue-500 text-white"
            onClick={confirm}
          >
            Confirm
          </button>
          <button
            className="mx-8 my-0 px-8 py-4 rounded-md bg-gray-500 text-white"
            onClick={cancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmPost
