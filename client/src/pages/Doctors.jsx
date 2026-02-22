import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "../styles/Doctors.css";

export default function Doctors() {

const [location,setLocation]=useState(null);

const [allDoctors,setAllDoctors]=useState([]);

const [nearDoctors,setNearDoctors]=useState([]);



/* Distance Calculation */

function getDistance(lat1,lon1,lat2,lon2){

const R=6371;

const dLat=(lat2-lat1)*(Math.PI/180);

const dLon=(lon2-lon1)*(Math.PI/180);

const a=

Math.sin(dLat/2)*Math.sin(dLat/2)+

Math.cos(lat1*(Math.PI/180))*

Math.cos(lat2*(Math.PI/180))*

Math.sin(dLon/2)*Math.sin(dLon/2);

const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

return R*c;

}



/* Image Generator */

const getDoctorImage=(name)=>{

return `https://source.unsplash.com/300x200/?doctor,clinic,${encodeURIComponent(name)}`;

};



useEffect(()=>{

navigator.geolocation.getCurrentPosition(

(pos)=>{

const lat=pos.coords.latitude;

const lng=pos.coords.longitude;

setLocation([lat,lng]);



axios.get(

`https://overpass.kumi.systems/api/interpreter?data=[out:json];node["amenity"="doctors"](around:8000,${lat},${lng});out;`

)

.then(res=>{


let data=res.data.elements

.filter(el=>el.tags?.name)

.map(d=>({

name:d.tags.name,

lat:d.lat,

lng:d.lon,

distance:getDistance(lat,lng,d.lat,d.lon),

image:getDoctorImage(d.tags.name)

}));



setAllDoctors(data);



data.sort((a,b)=>a.distance-b.distance);

setNearDoctors(data.slice(0,10));



})

.catch(err=>console.log(err));


}

);

},[]);



if(!location)

return <div className="loading">

Loading nearby doctors...

</div>;



return(

<div className="doctors-page">

<header className="page-header">

<h1>Doctors Near You</h1>

<p>Find nearby doctors and clinics</p>

</header>



{/* MAP */}

<MapContainer

center={location}

zoom={13}

className="leaflet-map"

>

<TileLayer

url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

/>



<Marker position={location}>

<Popup>

You are here

</Popup>

</Marker>



{allDoctors.map((d,i)=>(

<Marker key={i} position={[d.lat,d.lng]}>

<Popup>

<h3>{d.name}</h3>

<p>

Distance: {d.distance.toFixed(5)} km

</p>

</Popup>

</Marker>

))}

</MapContainer>



{/* DOCTOR LIST */}

<section className="doctor-list-section">

<h2>Nearby Doctors</h2>


<div className="doctor-list">

{nearDoctors.map((d,i)=>(

<div key={i} className="doctor-card">





<h3>

{d.name}

</h3>




</div>

))}

</div>

</section>


</div>

);

}
