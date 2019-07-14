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
  	    parola = req.body.parola,
  	    sectie = req.body.sectie;

  	if (data_angajare == 'NaN-NaN-NaN' || data_nastere == 'NaN-NaN-NaN'){
  		res.json({result: "Detalii Invalide"});
  	}

  	var con = mysql.createConnection({
	  //host: "34.65.30.185", // This does not work on App Engine
	  socketPath: "/cloudsql/scenic-hydra-241121:europe-west6:spital-license", // format required for App Engine
	  user: "server",
	  password: "sherlock2014",
	  database: "spital"
	});

	con.connect(function(err) {
	  if (err) throw err;
	  console.log("Connected!");
	});

	var sql = "SELECT email FROM angajati where email = \"" + email +"\"";
	con.query(sql, function(err, result) {
		if (err) throw err;
		console.log("Verificare existenta");
		if (result.length == 0){
			sql = "INSERT INTO angajati (nume, prenume, data_nastere, sex, adresa, telefon, email, CNP, data_angajare, pozitie, parola, sectie) values (\"" + nume + "\",\"" + prenume + "\",\"" + data_nastere + "\",\"" + sex + "\",\"" + adresa + "\",\"" + telefon + "\",\"" + email + "\",\"" + cnp + "\",\"" + data_angajare + "\",\"" + pozitie + "\",\"" + parola + "\",\"" + sectie + "\")";
			console.log(sql);
			
			con.query(sql, function (err, result) {
			    if (err) throw err;
			    console.log("Result: " + result);
			    res.json({result: "Succes"});
			  });
		} else {
			res.json({result: "Email deja utilizat"});
		}
	})


})

app.post('/login_angajat', function(req, res) {

	var email = req.body.email,
	parola = req.body.parola;

	var con = mysql.createConnection({
	  socketPath: "/cloudsql/scenic-hydra-241121:europe-west6:spital-license", // format required for App Engine
	  user: "server",
	  password: "sherlock2014",
	  database: "spital"
	});

	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
	});


	var sql = "SELECT * FROM administratori where email = \"" + email +"\" AND parola=\"" + parola + "\"";
	console.log(sql);

	con.query(sql, function (err, result) {
	    if (err) throw err;
	    console.log("Result: " + result.length);
	    if (result.length == 0) {
	    	sql = "SELECT * FROM angajati where email = \"" + email +"\" AND parola=\"" + parola + "\"";
			console.log(sql);

			con.query(sql, function (err, result) {
			    if (err) throw err;
			    console.log("Result: " + result.length);
			    if (result.length == 0) {
			    	sql = "SELECT * FROM pacienti where email = \"" + email +"\" AND parola=\"" + parola + "\"";
					console.log(sql);

					con.query(sql, function (err, result) {
					    if (err) throw err;
					    console.log("Result: " + result.length);
					    if (result.length == 0) res.json({result: 'inexistent'});
					    else { res.json( {result: result, tip: "pacient"} );}
					});
			    }
			    else { res.json( {result: result, tip: "angajat"} );}
			});
	    } else res.json( {result: result, tip: "administrator"} );
	});
})

app.post('/pacient/cautare', function(req, res) {
	var nume = req.body.nume,
		prenume = req.body.prenume;


	var con = mysql.createConnection({
	  socketPath: "/cloudsql/scenic-hydra-241121:europe-west6:spital-license", // format required for App Engine
	  user: "server",
	  password: "sherlock2014",
	  database: "spital"
	});

	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
	});

	var sql = "SELECT * FROM pacienti where nume = \"" + nume +"\" AND prenume=\"" + prenume + "\"";
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    console.log("Result: " + result.length);
	    if (result.length == 0) res.json({result: 'inexistent'});
	    else { res.json( {result: result} );}
	});
})

app.post('/pacient/diagnostic', function(req, res){
	var pacientID = req.body.pacientID,
		angajatID = req.body.angajatID,
		descriere = req.body.descriere,
		durata = req.body.durata,
		indicatii_suplimentare = req.body.indicatii_suplimentare,
		incepere_tratament = new Date(req.body.incepere_tratament).yyyymmdd();


	var con = mysql.createConnection({
	  socketPath: "/cloudsql/scenic-hydra-241121:europe-west6:spital-license", // format required for App Engine
	  user: "server",
	  password: "sherlock2014",
	  database: "spital"
	});

	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
	});

	// Adauga noul diagnostic, fara tratamentID
	var sql = "INSERT INTO diagnostice (angajatID, descriere, pacientID) values (\"" + angajatID + "\",\"" + descriere + "\",\"" + pacientID + "\")";
	console.log(sql);
	
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    console.log("Diagnostic adaugat.");
	});

	// Recupereaza IDul diagnosticului nou generat
	sql = "SELECT * FROM diagnostice where angajatID = \"" + angajatID + "\" AND descriere=\"" + descriere  + "\" AND pacientID=\"" + pacientID + "\"";
	console.log(sql);

	con.query(sql, function (err, result) {
	    if (err) throw err;
	    var result_json = JSON.stringify(result).slice(1);
	    result_json = result_json.slice(0, result_json.length - 1);
	    result_json = JSON.parse(result_json);
	    console.log("Result: " + result_json.diagnosticID);

	    var diagnosticID = result_json.diagnosticID;

	    // Adauga tratamentul pentru diagnostic, folosind diagnosticID
		sql = "INSERT INTO tratamente (diagnosticID, angajatID, indicatii_suplimentare, pacientID, durata, incepere_tratament) values (\"" + diagnosticID + "\",\"" + angajatID + "\",\"" + indicatii_suplimentare + "\",\"" + pacientID + "\",\"" + durata + "\",\"" + incepere_tratament + "\")";
		console.log(sql);
		
		con.query(sql, function (err, result) {
		    if (err) throw err;
		    var result_json = JSON.stringify(result);
		    console.log("Result: " + result_json);
		});

		// Recupereaza IDul tratamentului nou generat
		sql = "SELECT * FROM tratamente where angajatID = \"" + angajatID + "\" AND pacientID=\"" + pacientID + "\" AND diagnosticID=\"" + diagnosticID + "\"";
		console.log(sql);

		con.query(sql, function (err, result) {
		    if (err) throw err;

		    var result_json = JSON.stringify(result).slice(1);
		    result_json = result_json.slice(0, result_json.length - 1);
		    result_json = JSON.parse(result_json);
		    console.log("Result: " + result_json.tratamentID);
			var tratamentID = result_json.tratamentID;

			// Adauga tratamentID diagnosticului adaugat inainte
			sql = "UPDATE diagnostice SET tratamentID = \"" + tratamentID + "\"";
			console.log(sql);

			con.query(sql, function (err, result) {
			    if (err) throw err;
			    var result_json = JSON.stringify(result);
			    console.log("Result: " + result_json);
			    res.json({result: "Succes"});
			});
		});
	});
})


app.post('/pacient/diagnostic/observatii/creare', function(req, res){
	var pacientCNP = req.body.pacientCNP,
		angajatID = req.body.angajatID,
		diagnosticID = req.body.diagnosticID,
		continut = req.body.continut,
		sectie = req.body.sectie,
		data_ora = new Date().yyyymmdd();

	var con = mysql.createConnection({
	  socketPath: "/cloudsql/scenic-hydra-241121:europe-west6:spital-license", // format required for App Engine
	  user: "server",
	  password: "sherlock2014",
	  database: "spital"
	});

	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
	});

	// "DiagnoticID" - typo in baza de date..nu reusesc sa alterez tabelul, m-am lasat dupa 30 minute
	var sql = "INSERT INTO observatii (diagnoticID, angajatID, pacientCNP, continut, sectie, data_ora) values (\"" + diagnosticID + "\",\"" + angajatID + "\",\"" + pacientCNP + "\",\"" + continut + "\",\"" + sectie + "\",\"" + data_ora + "\")";
	console.log(sql);
		
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    var result_json = JSON.stringify(result);
	    console.log("Result: " + result_json);
		res.json({result: "Succes"});
	});
})


app.post('/pacient/diagnostic/observatii', function(req, res){
	var pacientCNP = req.body.pacientCNP,
		diagnosticID = req.body.diagnosticID;

	var con = mysql.createConnection({
	  socketPath: "/cloudsql/scenic-hydra-241121:europe-west6:spital-license", // format required for App Engine
	  user: "server",
	  password: "sherlock2014",
	  database: "spital"
	});

	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
	});

	// "DiagnoticID" - typo in baza de date..nu reusesc sa alterez tabelul, m-am lasat dupa 30 minute
	var sql = "SELECT * FROM observatii where pacientCNP=\"" + pacientCNP + "\" AND diagnoticID=\"" + diagnosticID + "\"";
	console.log(sql);
		
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    var result_json = JSON.stringify(result);
	    console.log("Result: " + result_json);
		res.json({result: result});
	});
})
