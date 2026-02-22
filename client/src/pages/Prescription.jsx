import { useState } from "react";
import axios from "axios";
import "../styles/Prescription.css";

export default function Prescription(){

const [search,setSearch]=useState("");

const [medicine,setMedicine]=useState(null);

const [loading,setLoading]=useState(false);

const [error,setError]=useState("");



/* SEARCH MEDICINE */

const searchMedicine=async()=>{

if(!search) return;

setLoading(true);

setError("");

try{

const res=await axios.get(

`https://api.fda.gov/drug/label.json?search=(openfda.brand_name:${search}+OR+openfda.generic_name:${search})&limit=1`

);

let data=res.data.results[0];

setMedicine({

name:
data.openfda?.brand_name?.[0] ||
data.openfda?.generic_name?.[0] ||
search,

uses:
data.indications_and_usage?.[0] ||
"Uses not available",

sideEffects:
data.adverse_reactions?.[0] ||
"Side effects not available",

warnings:
data.warnings?.[0] ||
"Warnings not available"

});

}
catch(e){

setError("Medicine not found");

setMedicine(null);

}

setLoading(false);

};



return(

<div className="prescription-page">

<h1>Medicine Search</h1>

<p>Search medicine name</p>


<div className="search-box">

<input

type="text"

placeholder="Example: Acetaminophen"
value={search}

onChange={(e)=>setSearch(e.target.value)}

/>

<button onClick={searchMedicine}>

Search

</button>

</div>



{loading &&

<div className="loading">

Searching medicine...

</div>

}



{error &&

<div className="error">

{error}

</div>

}



{medicine &&(

<div className="medicine-card">

<h2>{medicine.name}</h2>

<h3>Uses</h3>

<p>{medicine.uses}</p>

<h3>Side Effects</h3>

<p>{medicine.sideEffects}</p>

<h3>Warnings</h3>

<p>{medicine.warnings}</p>

</div>

)}

</div>

);

}