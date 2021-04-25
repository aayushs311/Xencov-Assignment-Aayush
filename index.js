const connectDB = require('./db');
const fs = require("fs");
const fastcsv = require("fast-csv");
const express = require('express');
const multer = require('multer');
const app = express();

global.__basedir = __dirname;
 
// Multer - Middleware to store upload file
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
	   cb(null, __basedir + '/uploads/')
	},
	filename: (req, file, cb) => {
	   cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
	}
});
 
const upload = multer({storage: storage});

// Express REST API
app.post('/api/uploadfile', upload.single("uploadfile"), (req, res) =>{
	uploadCSV(__basedir + '/uploads/' + req.file.filename);
	res.json({
				'msg': 'File uploaded/import successfully!', 'file': req.file
			});
});

function uploadCSV (filepath) {
let stream = fs.createReadStream(filepath);
let csvData = [];
let csvStream = fastcsv
  .parse()
  .on("data", function(data) {
    csvData.push(data);
  })
  .on("end", function() {
    // remove the first line: header
    csvData.shift();

    // insert into table
    const query = "INSERT INTO MYTABLE (Region, Country, Item_Type, Sales_Channel, Order_Priority, Order_Date, Order_ID, Ship_Date, Units_Sold, Unit_Price, Unit_Cost, Total_Revenue, Total_Cost, Total_Profit) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)";

    connectDB.connect((err, client, done) => {
      if (err) throw err;

      try {
        csvData.forEach(row => {
          client.query(query, row, (err, res) => {
            if (err) {
              console.log(err.stack);
            } else {
              console.log("inserted " + res.rowCount + " row:", row);
            }
          });
        });
      } finally {
        done();
      }
    });
  });

  stream.pipe(csvStream);
}

// Create a Server
app.listen(8080, function () {

  console.log("App is listening at 8080")
 
})