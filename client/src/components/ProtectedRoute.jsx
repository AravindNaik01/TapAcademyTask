import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, accessToken } = useSelector((state) => state.auth)
  
  // Check localStorage as fallback
  const token = accessToken || localStorage.getItem('accessToken')
  const storedUser = user || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null)

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && storedUser.role !== requiredRole) {
    return (
      <Navigate
        to={storedUser.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'}
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute
