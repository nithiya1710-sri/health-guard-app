import { useState } from "react";

import { auth, db } from "../services/firebase";

import {
collection,
addDoc,
serverTimestamp,
doc,
getDoc
} from "firebase/firestore";

import "../styles/SOS.css";
import axios from "axios";

export default function SOS(){

const [loading,setLoading]=useState(false);

const [message,setMessage]=useState("");



/* =====================
SEND SOS
===================== */

const sendSOS = async () => {

setLoading(true);

navigator.geolocation.getCurrentPosition(

async(position)=>{

try{

const latitude = position.coords.latitude;
const longitude = position.coords.longitude;

const uid = auth.currentUser.uid;


/* Get Profile */

const profileRef =
doc(db,"profiles",uid);

const profileSnap =
await getDoc(profileRef);

const profile =
profileSnap.data();


/* Save SOS */

await addDoc(

collection(db,"sos"),

{

uid:uid,

name:profile.name,

phone:profile.phone,

latitude:latitude,

longitude:longitude,

status:"active",

createdAt:serverTimestamp()

}

);


/* Send SMS API */

await axios.post(
"http://localhost:5000/sos",
{
name:profile.name,
phone:profile.phone,
bloodGroup:profile.bloodGroup,
condition:profile.condition,

email:profile.email,

latitude:latitude,
longitude:longitude
});

setMessage("SOS Sent Successfully");

setLoading(false);

}
catch(err){

console.log(err);

setMessage("Error sending SOS");

setLoading(false);

}

},

()=>{

setMessage("Location permission needed");

setLoading(false);

}

);

};


return(

<div className="sos-container">

<div className="sos-card">

<h1>

Emergency SOS

</h1>

<p>

Press button to send your location instantly

</p>


<button

className="sos-button"

onClick={sendSOS}

disabled={loading}

>

{loading?"Sending...":"SEND SOS"}

</button>


<p className="status">

{message}

</p>


</div>

</div>

);

}