const router = require("express").Router();
const { admin, db } = require("../firebaseAdmin");


/* ======================
Verify User
====================== */

const verifyUser = async (req,res,next)=>{

const idToken =
req.headers.authorization?.split("Bearer ")[1];

if(!idToken){

return res.status(401).json({
error:"No token"
});

}

try{

const decoded=
await admin.auth().verifyIdToken(idToken);

req.user=decoded;

next();

}
catch(err){

res.status(401).json({
error:"Invalid token"
});

}

};


/* ======================
SAVE PROFILE
====================== */

router.post("/",verifyUser,async(req,res)=>{

try{

const {

name,
age,
phone,
bloodGroup,
address,
emergencyContact

}=req.body;


const profileData={

uid:req.user.uid,

name,
age,
phone,
bloodGroup,
address,
emergencyContact,

createdAt:
admin.firestore.FieldValue.serverTimestamp()

};


await db
.collection("profiles")
.doc(req.user.uid)
.set(profileData);


res.json({
message:"Profile saved"
});

}
catch(err){

console.log(err);

res.status(500).json({
error:"Save failed"
});

}

});


/* ======================
GET PROFILE
====================== */

router.get("/",verifyUser,async(req,res)=>{

try{

const doc=
await db
.collection("profiles")
.doc(req.user.uid)
.get();


if(!doc.exists){

return res.json(null);

}

res.json(doc.data());

}
catch(err){

res.status(500).json({
error:"Fetch failed"
});

}

});


module.exports=router;