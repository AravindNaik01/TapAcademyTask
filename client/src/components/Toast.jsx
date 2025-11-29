import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'

const Toast = () => {
  const dispatch = useDispatch()
  const { message, type } = useSelector((state) => state.toast || {})

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        dispatch({ type: 'toast/clear' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message, dispatch])

  if (!message) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`px-6 py-4 rounded-lg shadow-lg ${
          type === 'success'
            ? 'bg-green-500 text-white'
            : type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }`}
      >
        {message}
      </div>
    </div>
  )
}

export default Toast

