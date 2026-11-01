import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // ឆែកមើល token ក្នុង local storage
  const token = localStorage.getItem('token'); 

  // បើគ្មាន token ទេ ឱ្យរុញទៅទំព័រ login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // បើមាន token ឱ្យចូលមើលទំព័រខាងក្នុងបាន
  return <Outlet />;
};

export default ProtectedRoute;
