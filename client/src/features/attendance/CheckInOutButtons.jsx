import { useState } from 'react'
import { useCheckInMutation, useCheckOutMutation, useGetTodayQuery } from './attendanceApi.js'
import { useDispatch } from 'react-redux'

const CheckInOutButtons = () => {
  const dispatch = useDispatch()
  const { data: todayData, isLoading: isLoadingToday, refetch } = useGetTodayQuery()
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation()
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation()
  const [showConfirmCheckOut, setShowConfirmCheckOut] = useState(false)

  const attendance = todayData?.data?.attendance
  const status = todayData?.data?.status || 'not checked in'

  const canCheckIn = status === 'not checked in'
  const canCheckOut = status === 'checked in'

  const handleCheckIn = async () => {
    try {
      await checkIn().unwrap()
      dispatch({
        type: 'toast/show',
        payload: { message: '✓ Checked in successfully!', type: 'success' },
      })
      // Refetch to update UI immediately
      setTimeout(() => {
        refetch()
      }, 500)
    } catch (err) {
      dispatch({
        type: 'toast/show',
        payload: {
          message: err.data?.message || 'Failed to check in. Please try again.',
          type: 'error',
        },
      })
    }
  }

  const handleCheckOut = async () => {
    try {
      await checkOut().unwrap()
      setShowConfirmCheckOut(false)
      dispatch({
        type: 'toast/show',
        payload: { message: '✓ Checked out successfully!', type: 'success' },
      })
      // Refetch to update UI immediately
      setTimeout(() => {
        refetch()
      }, 500)
    } catch (err) {
      setShowConfirmCheckOut(false)
      dispatch({
        type: 'toast/show',
        payload: {
          message: err.data?.message || 'Failed to check out. Please try again.',
          type: 'error',
        },
      })
    }
  }

  const confirmCheckOut = () => {
    setShowConfirmCheckOut(true)
  }

  const cancelCheckOut = () => {
    setShowConfirmCheckOut(false)
  }

  if (isLoadingToday) {
    return (
      <div className="flex gap-4">
        <button
          disabled
          className="flex-1 py-3 px-6 rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
        >
          <span className="inline-flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </span>
        </button>
      </div>
    )
  }

  if (showConfirmCheckOut) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold mb-2">Confirm Check Out</p>
          <p className="text-sm text-yellow-700">
            Are you sure you want to check out? This will end your attendance tracking for today.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleCheckOut}
            disabled={isCheckingOut}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${isCheckingOut
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white transform hover:scale-105'
              }`}
          >
            {isCheckingOut ? (
              <span className="inline-flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Checking Out...
              </span>
            ) : (
              'Yes, Check Out'
            )}
          </button>
          <button
            onClick={cancelCheckOut}
            disabled={isCheckingOut}
            className="flex-1 py-3 px-6 rounded-lg font-semibold bg-gray-300 hover:bg-gray-400 text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center w-full">
      {status === 'not checked in' && (
        <button
          onClick={handleCheckIn}
          disabled={isCheckingIn}
          className={`w-full sm:w-auto min-w-[200px] py-4 px-8 rounded-lg font-semibold text-lg transition-all transform ${!isCheckingIn
              ? 'bg-green-500 hover:bg-green-600 text-white hover:scale-105 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isCheckingIn ? (
            <span className="inline-flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking In...
            </span>
          ) : (
            <span className="inline-flex items-center justify-center">
              <span className="mr-2">✓</span> Check In
            </span>
          )}
        </button>
      )}

      {status === 'checked in' && (
        <button
          onClick={confirmCheckOut}
          disabled={isCheckingOut}
          className={`w-full sm:w-auto min-w-[200px] py-4 px-8 rounded-lg font-semibold text-lg transition-all transform ${!isCheckingOut
              ? 'bg-red-500 hover:bg-red-600 text-white hover:scale-105 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isCheckingOut ? (
            <span className="inline-flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking Out...
            </span>
          ) : (
            <span className="inline-flex items-center justify-center">
              <span className="mr-2">✓✓</span> Check Out
            </span>
          )}
        </button>
      )}

      {status === 'checked out' && (
        <button
          disabled
          className="w-full sm:w-auto min-w-[200px] py-4 px-8 rounded-lg font-semibold text-lg bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
        >
          <span className="inline-flex items-center justify-center">
            <span className="mr-2">✓</span> Attendance Completed
          </span>
        </button>
      )}
    </div>
  )
}

export default CheckInOutButtons
