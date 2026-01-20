import { Navigate,Outlet } from "react-router-dom";
import {useAdmin} from "@/hooks/useAdmin"

const ProtectedRoute = () => {
  const {data: user, isLoading, isError} = useAdmin();

  if(isLoading){
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  if(isError || !user){
    return <Navigate to="/" replace/>
  }

  return <Outlet/>
}

export default ProtectedRoute