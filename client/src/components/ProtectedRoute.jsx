import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, accessToken } = useSelector((state) => state.auth)

  // Check sessionStorage as fallback
  const token = accessToken || sessionStorage.getItem('accessToken')
  const storedUser = user || (sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null)

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
