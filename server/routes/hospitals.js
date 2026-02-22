const express=require("express");
const csv=require("csv-parser");
const fs=require("fs");

const router=express.Router();

let hospitals=[];

fs.createReadStream("./data/hospitals.csv")
.pipe(csv())
.on("data",(row)=>{

hospitals.push({
name:row["Hospital Name"],
city:row["City"],
state:row["State"],
address:row["Address"],
lat:parseFloat(row["Latitude"]),
lng:parseFloat(row["Longitude"])
})

})

.on("end",()=>{
console.log("Hospitals Loaded")
});


router.get("/",(req,res)=>{

res.json(hospitals)

})


module.exports=router;