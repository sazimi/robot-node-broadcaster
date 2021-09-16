const { Notion } = require('@neurosity/notion')
const express = require("express"); // express
const app = express(); // required headers

require('dotenv').config();

const notion = new Notion({
    deviceId: process.env.CROWN_ID
});


var isFlying = false;
var isLeft = false;
var isRight = false;
var legoMoving = false;
const main = async () => {
    await notion
        .login({
            email: process.env.CROWN_EMAIL,
            password: process.env.CROWN_PASS
        }).then(() => {
            console.log("It is Logged in");

            notion.selectDevice((devices) => {
                return devices.find((device) => device.deviceNickname === "Crown-1E8");
            });
            notion.accelerometer().subscribe(accelerometer => {

                if (accelerometer.acceleration > 1 && !isLeft) {
                    if (accelerometer.pitch > 30) {
                        isLeft = true;
                        isRight = false;
                    }

                    if (accelerometer.pitch < -30 && !isRight) {
                        isRight = true;
                        isLeft = false;
                    }
                }

            });

        })
        .catch((error) => {
            console.log(error);
            throw new Error(error);
        });

    notion.focus().subscribe((focus) => {
        console.log(focus.probability);
        if (focus.probability > 0.2) {
            if (!isFlying) {
                isFlying = true;
                legoMoving = true;
            }
        }
        else legoMoving = false

    });

};

main();

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();

});

app.get("/", function (req, res) {

    res.send(legoMoving);

}); // port 3333

let port = process.env.PORT;

if (port == null || port == "") {

    port = 3333;

} app.listen(port, function () {

    console.log("Success");

});

