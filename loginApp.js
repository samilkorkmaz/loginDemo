//Simple login demo. This is the server side NodeJS script.
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
var http = require('http').Server(app);
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser"); //to parse post requests
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname)); //for image resources to load properly in HTML page.

const userDataFileName = "user.json";
var user = { emails: [], passwordHashes: [] };

app.post('/register', function (req, res) {
    console.log("Registration info: ", req.body);
    for (var i = 0; i < user.emails.length; i++) {
        if (req.body.email === user.emails[i]) {
            res.send("<h1>Email " + req.body.email + " already exists.</h1>");
            return;
        }
    }
    var hash = bcrypt.hashSync(req.body.password, 10);
    console.log("Added " + req.body.email);
    user.emails.push(req.body.email);
    user.passwordHashes.push(hash);
    json = JSON.stringify(user);
    fs.writeFile(userDataFileName, json, 'utf8', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(userDataFileName + " updated.");
        }
    });
    res.send("<h1>" + req.body.email + " registered.</h1>");
});

app.post('/login', function (req, res) {
    //console.log(req.body);
    if (userExists(req.body)) {
        if (req.body.remember === 'on') res.cookie("userData", { email: req.body.email, loggedIn: true }); //set cookie
        sendHTMLWithEmail(res, 'loggedIn.html', req.body.email);
    } else {
        res.send('<h1>User name or password does not exit!</h1>');
    }
});

function sendHTMLWithEmail(res, htmlFileName, email) {
    fs.readFile(__dirname + '/' + htmlFileName, 'utf8', function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading ' + htmlFileName);
        }
        res.writeHead(200);
        var modifiedData = data.replace("Logged in", email + " logged in");
        res.end(modifiedData);
    }
    );
}

function sendHTML(res, htmlFileName) {
    fs.readFile(__dirname + '/' + htmlFileName, 'utf8', function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading ' + htmlFileName);
        }
        res.writeHead(200);
        res.end(data);
    });
}

app.get('/termsAndPrivacy', function (req, res) {
    sendHTML(res, 'termsAndPrivacy.html');
});

app.get('/', function (req, res) {
    console.log("Existing cookies: ", req.cookies);
    if (req.cookies.userData === undefined || !req.cookies.userData.loggedIn) {
        console.log("Not logged in.");
        sendHTML(res, 'login.html');
    } else {
        console.log(req.cookies.userData.email + " already logged in.")
        sendHTMLWithEmail(res, 'loggedIn.html', req.cookies.userData.email);
    }
});

app.get('/logout', function (req, res) {
    sendHTML(res, 'login.html');
});

app.get('/showRegistrationForm', function (req, res) {
    sendHTML(res, 'register.html');
});

function userExists(userData) {
    console.log("Checking if " + userData.email + " exists.");
    if (fs.existsSync(userDataFileName)) {
        for (var i = 0; i < user.emails.length; i++) {
            console.log("Checking hash for " + user.emails[i]);
            if (userData.email === user.emails[i]) {
                if (bcrypt.compareSync(userData.password, user.passwordHashes[i])) {
                    console.log(userData.email + " matched.");
                    return true;
                }
            }
        }
    } else {
        console.log(userDataFileName + " does not exist. Not checking.")
    }
    return false;
}

http.listen(3000, function () {
    console.log('listening on *:3000');
    if (fs.existsSync(userDataFileName)) {
        fs.readFile(userDataFileName, function read(err, data) {
            if (err) {
                throw err;
            }
            user = JSON.parse(data);
            console.log("Read user data.");
            //console.log(user);
        });
    }
});
