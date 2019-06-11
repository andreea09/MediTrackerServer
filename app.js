'use strict';

// [START gae_node_request_example]
const express  = require('express');
var bodyParser = require("body-parser");
var moment = require("moment");
var mysql = require('mysql');

const app = express();

app.use(bodyParser.json());  // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.json());       // to support JSON-encoded bodies
app.locals.moment = require('moment');
moment().format();
// Browser accessed endpoint - use to check that server is up.
app.get('/', (req, res) => {
  	res
	    .status(200)
	    .send('Hello, world - this is the endpoint for the MediTracker app.')
	    .end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  	console.log(`App listening on port ${PORT}`);
  	console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]


// Date prototype formated in order to be accepted by the native MySQL Date type 
Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]); // padding
};

// Create user endpoint
app.post('/create', function(req, res) {
  	res.json({create: "This is the endpoint for creating a user."})

  	var nume = req.body.nume,
  		prenume = req.body.prenume,
  		data_nastere = new Date(req.body.data_nastere).yyyymmdd(),
  		sex = req.body.sex,
  		adresa = req.body.adresa,
  		telefon = req.body.telefon,
  		email = req.body.email,
  		cnp = req.body.cnp,
  		data_angajare = new Date().yyyymmdd(),
  		pozitie = req.body.pozitie,
  	    parola = req.body.parola;

  	var con = mysql.createConnection({
	  host: "34.65.30.185",
	  user: "server",
	  password: "sherlock2014",
	  database: "spital"
	});

	con.connect(function(err) {
	  if (err) throw err;
	  console.log("Connected!");
	});

	var sql = "INSERT INTO angajati (nume, prenume, data_nastere, sex, adresa, telefon, email, CNP, data_angajare, pozitie, parola) values (\"" + nume + "\",\"" + prenume + "\",\"" + data_nastere + "\",\"" + sex + "\",\"" + adresa + "\",\"" + telefon + "\",\"" + email + "\",\"" + cnp + "\",\"" + data_angajare + "\",\"" + pozitie + "\",\"" + parola + "\")";
	console.log(sql);

	
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    console.log("Result: " + result);
	  });

})
