const express=require("express");
const cors=require("cors");

const appointments=require("./routes/appointments");
const doctors=require("./routes/doctors");
const sos=require("./routes/sos");


const app=express();
const db = require("./firebaseAdmin");
const remainders= require("./routes/remainders")
const profileRoutes=require("./routes/profile");


app.use(cors());
app.use(express.json());

app.use("/appointments",appointments);
app.use("/doctors",doctors);
app.use("/sos",sos);
app.use("/profile",profileRoutes);
app.use("/remainders",remainders);
console.log("Firebase Connected");

app.listen(5000,()=>{
console.log("Server Running")
});