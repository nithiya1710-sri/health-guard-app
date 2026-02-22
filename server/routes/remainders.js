const nodemailer=require("nodemailer");
const cron=require("node-cron");

const transporter=nodemailer.createTransport({

service:"gmail",

auth:{
user:"yourmail@gmail.com",
pass:"app-password"
}

});

function sendMail(email,title,date,time){

transporter.sendMail({

from:"Health Guard <yourmail@gmail.com>",

to:email,

subject:"Health Reminder",

text:`
Dear User,

This is a reminder to complete your health task.

Task: ${title}
Date: ${date}
Time: ${time}

Please complete it on time.

Regards,
Health Guard Team
`

});

}

module.exports=sendMail;