import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "leaflet/dist/leaflet.css";

export default function MapView(){

const navigate = useNavigate();

const [location,setLocation]=useState(null);
const [hospitals,setHospitals]=useState([]);


// Distance calculation
function getDistance(lat1,lon1,lat2,lon2){

const R=6371;

const dLat=(lat2-lat1)*Math.PI/180;
const dLon=(lon2-lon1)*Math.PI/180;

const a=
Math.sin(dLat/2)*Math.sin(dLat/2)+
Math.cos(lat1*Math.PI/180)*
Math.cos(lat2*Math.PI/180)*
Math.sin(dLon/2)*Math.sin(dLon/2);

const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

return R*c;

}


useEffect(()=>{

navigator.geolocation.getCurrentPosition((pos)=>{

const lat=pos.coords.latitude;
const lng=pos.coords.longitude;

setLocation([lat,lng]);

axios.get(
`https://overpass.kumi.systems/api/interpreter?data=[out:json];node["amenity"="hospital"](around:8000,${lat},${lng});out;`
)

.then(res=>{

let data=res.data.elements.map(h=>({

name:h.tags?.name || "Hospital",
lat:h.lat,
lng:h.lon,
distance:getDistance(lat,lng,h.lat,h.lon)

}));


// Sort by distance

data.sort((a,b)=>a.distance-b.distance);


// Top 10 hospitals

setHospitals(data.slice(0,10));

})

.catch(err=>console.log(err));

});

},[]);


if(!location) return <h3>Loading Map...</h3>;


const bookHospital=(name)=>{

localStorage.setItem("hospital",name);

navigate("/appointments");

};


return(

<div>


<h2>Nearby Hospitals</h2>


{/* Map */}

<MapContainer
center={location}
zoom={13}
style={{height:"400px",width:"100%"}}
>

<TileLayer
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>


{/* User */}

<Marker position={location}>
<Popup>You are here</Popup>
</Marker>


{/* Hospitals */}

{hospitals.map((h,i)=>(

<Marker
key={i}
position={[h.lat,h.lng]}
>

<Popup>

<h3>{h.name}</h3>

<p>{h.distance.toFixed(2)} km</p>

<button onClick={()=>bookHospital(h.name)}>
Book Appointment
</button>

</Popup>

</Marker>

))}

</MapContainer>


<br/>


{/* Hospital List */}

<h3>10 Nearest Hospitals</h3>


{hospitals.map((h,i)=>(

<div key={i} style={{
border:"1px solid gray",
padding:"10px",
marginBottom:"10px"
}}>

<h4>{h.name}</h4>

<p>Distance: {h.distance.toFixed(2)} km</p>

<button onClick={()=>bookHospital(h.name)}>
Book Appointment
</button>

</div>

))}


</div>

)

}