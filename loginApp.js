//Simple login demo. This is the server side NodeJS script.
const express = require('express')
const app = express()
var http = require('http').Server(app);
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser"); //to parse post requests
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname)); //for image resources to load properly in HTML page.

app.post('/register', function (req, res) {
    console.log("Registration info: ", req.body);
    res.send("<h1>Registration info:" + JSON.stringify(req.body) + "</h1>");
});

app.post('/login', function (req, res) {
    console.log(req.body);
    if (userExists(req.body)) {
        if (req.body.remember === 'on') res.cookie("userData", { name:req.body.name, loggedIn: true }); //set cookie
        sendHTML(res, 'data.html');
    } else {
        res.send('<h1>User name or password does not exit!</h1>');
    }
});

function sendHTML(res, htmlFileName) {
    fs.readFile(__dirname + '/' + htmlFileName,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ' + htmlFileName);
            }
            res.writeHead(200);
            res.end(data);
        }
    );
}

var existingUser = { name: "samil", password: "123456" };

app.get('/', function (req, res) {
    console.log("Existing cookies: ", req.cookies);
    if (req.cookies.userData === undefined || !req.cookies.userData.loggedIn) {
        console.log("Not logged in.");
        sendHTML(res, 'login.html');
    } else {
        console.log(req.cookies.userData.name + " already logged in.")
        sendHTML(res, 'data.html');
    }
});

app.get('/logout', function (req, res) {
    sendHTML(res, 'login.html');
});

app.get('/showRegistrationForm', function (req, res) {
    sendHTML(res, 'register.html');
});

function userExists(userData) {
    return userData.name === existingUser.name && userData.password === existingUser.password;
}

http.listen(3000, function () {
    console.log('listening on *:3000');
});
