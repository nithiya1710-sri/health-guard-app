
const router=require("express").Router();

router.get("/",(req,res)=>{

res.json([
{id:1,name:"Dr Kumar",specialization:"Cardiologist"},
{id:2,name:"Dr Priya",specialization:"Dermatologist"}
])

})

module.exports=router;
