import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup"
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import Hospitals from "./pages/Hospitals";
import SOS from "./pages/SOS";
import Appointments from "./pages/Appointments";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./context/ProctectedRoute";
import Profile from "./pages/Profile";
import Prescription from "./pages/Prescription";
import Remainders from "./pages/Remainders";
export default function App(){

return(

<AuthProvider>

<BrowserRouter>

<Routes>


{/* Public Routes */}
<Route path="/" element={<Login/>}/>
<Route path="/login" element={<Login/>}/>

<Route path="/signup" element={<Signup/>}/>

<Route path="/completeProfile" element={<CompleteProfile/>}/>
<Route path="/profile" element={<Profile/>}/>

<Route path="/prescription" element={<Prescription/>}/>
{/* Protected Routes */}
<Route path="/remainders" element={<Remainders/>}/>
<Route path="/dashboard" element={

<ProtectedRoute>
<Dashboard/>
</ProtectedRoute>

}/>


<Route path="/hospitals" element={

<ProtectedRoute>
<Hospitals/>
</ProtectedRoute>

}/>


<Route path="/appointments" element={

<ProtectedRoute>
<Appointments/>
</ProtectedRoute>

}/>


<Route path="/doctors" element={

<ProtectedRoute>
<Doctors/>
</ProtectedRoute>

}/>


<Route path="/sos" element={

<ProtectedRoute>
<SOS/>
</ProtectedRoute>

}/>

<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/appointments" element={<Appointments />} />

</Route>

</Routes>

</BrowserRouter>

</AuthProvider>

)

}