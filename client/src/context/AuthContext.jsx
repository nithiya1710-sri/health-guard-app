import { auth ,db} from "../services/firebase";
import { createContext,useState,useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";


export const AuthContext=createContext();


export default function AuthProvider({children}){

const [user,setUser]=useState(null);


useEffect(()=>{

onAuthStateChanged(auth,(currentUser)=>{

setUser(currentUser);

})

},[]);


return(

<AuthContext.Provider value={{user}}>

{children}

</AuthContext.Provider>

)

}