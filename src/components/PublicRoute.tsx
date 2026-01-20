import { Navigate, Outlet } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";


const PublicRoute = () => {
  const {data: user, isLoading} = useAdmin();

  if(isLoading) return null;

  if(user){
    return <Navigate to="/dashboard" replace/>
  }

  return <Outlet/>
}

export default PublicRoute;