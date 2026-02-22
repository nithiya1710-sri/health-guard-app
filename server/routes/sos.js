const router = require("express").Router();
const nodemailer = require("nodemailer");


/* ===============================
GMAIL CONFIGURATION
=============================== */

const EMAIL = "healthguard.alert@gmail.com";

const PASSWORD = "ynbgorejypxasuua"; // Gmail App Password


const transporter = nodemailer.createTransport({

service: "gmail",

auth: {
user: EMAIL,
pass: PASSWORD
}

});


/* ===============================
SEND SOS EMAIL
=============================== */

router.post("/", async (req,res)=>{

try{

const {

name,
phone,
bloodGroup,
condition,
email,
latitude,
longitude

} = req.body;


/* DEBUG CHECK */

console.log("SOS Request Data:");
console.log(req.body);

console.log("Emergency Email:", email);


/* ===============================
GOOGLE MAP LINK
=============================== */

const mapLink =
`https://maps.google.com/?q=${latitude},${longitude}`;


/* ===============================
CURRENT TIME
=============================== */

const dateTime =
new Date().toLocaleString();


/* ===============================
FORMAL HEALTHGUARD EMAIL
=============================== */

const emailHTML = `

<h2>HealthGuard Emergency Alert</h2>

<p>Dear Emergency Contact,</p>

<p>
This is an automated emergency notification from
<b>HealthGuard Emergency Monitoring System</b>.
</p>

<p>
An emergency alert has been triggered by the following
registered HealthGuard user.
Immediate assistance may be required.
</p>

<hr>

<h3>Patient Information</h3>

<p>

<b>Name:</b> ${name}<br>

<b>Phone Number:</b> ${phone}<br>

<b>Blood Group:</b> ${bloodGroup || "Not Available"}<br>

<b>Medical Condition:</b> ${condition || "Not Available"}

</p>

<hr>

<h3>Emergency Details</h3>

<p>

<b>Alert Time:</b> ${dateTime}

<br><br>

<b>Last Known Location:</b>

<br>

<a href="${mapLink}">
View Location on Google Maps
</a>

</p>

<hr>

<p>

You are receiving this message because your contact
details have been registered as an emergency contact
in the HealthGuard system.

</p>

<p>

Please try to contact the individual immediately or
take appropriate action if necessary.

</p>

<p>

If the situation appears critical, please contact
local emergency services without delay.

</p>

<br>

<p>

<b>HealthGuard Emergency Monitoring System</b>

<br>

Automated Alert Notification

</p>

<p style="color:gray;font-size:12px">

This is an automated message.
Please do not reply to this email.

</p>

`;


/* ===============================
SEND EMAIL
=============================== */

const receiverEmail = email || "healthguard.alert@gmail.com";

if(!receiverEmail){

console.log("No email provided");

return res.status(400).json({
error:"No email provided"
});

}

await transporter.sendMail({

from:`HealthGuard <${EMAIL}>`,

to:receiverEmail,

subject:"HealthGuard Emergency Alert",

html:emailHTML

});

console.log("SOS Email Sent Successfully");


res.json({

message: "SOS Email Sent Successfully"

});


}
catch(err){

console.log("EMAIL ERROR:", err);

res.status(500).json({

error: "Email Sending Failed"

});

}

});


module.exports = router;