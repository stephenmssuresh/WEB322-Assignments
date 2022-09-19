/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Stephen Suresh    Student ID: 117916213     Date: February 19, 2022
*
* Online (Heroku) Link: https://immense-earth-63666.herokuapp.com/
*
********************************************************************************/

const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require('body-parser');
const fs = require("fs");
const multer = require('multer');
const dataService = require('./data-service.js');

const urlencodedParser = bodyParser.urlencoded({ extended: true });
const  storage = multer.diskStorage({
  destination: './public/images/uploaded/',
  filename: function(req, file, cb){
    cb(null, Date.now() + path.extname(file.originalname));
  }
})

const upload = multer({ storage: storage });

const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

app.get("/images/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addImage.html"));
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect('/images')
});

app.get('/images', (req,res) => {
  fs.readdir((__dirname + '/public/images/uploaded'), (err, items) =>{
    var images = { images: items };
    //res.json(items);
    res.json(images);
  });
});

app.get("/employees", (req, res) => {
  //limitation: can only handle 1 query string at a time
  if(req.query.status){
    //status
    // console.log(req.query.status);
    dataService.getEmployeesbyStatus(req.query.status)
    .then(function(data){
      res.json(data);
    })
    .catch(function(reason){
      res.send(reason);
    });
  }
  else if(req.query.department){
    //department
    dataService.getEmployeesbyDepartment(req.query.department)
    .then(function(data){
      res.json(data);
    })
    .catch(function(reason){
      res.send(reason);
    });
  }
  else if(req.query.manager){    
    //employeeManagerNum
    dataService.getEmployeesbyManager(req.query.manager)
    .then(function(data){
      res.json(data);
    })
    .catch(function(reason){
      res.send(reason);
    });
  }
  else{
    dataService.getAllEmployees()
    .then(function(data){
      res.json(data)
    })
    .catch(function(reason){
      res.send(reason);
    });
  };
});

app.post('/employees/add', urlencodedParser, (req,res) => {
  //console.log(req.body);
  dataService.addEmployee(req.body)
  .then(()=>{
    res.redirect('/employees');
  })
  .catch((reason) => {
    res.send(reason);
  })
});

app.get("/employees/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
});

app.get("/employees/:value", (req, res) => {
  dataService.getEmployeebyNum(req.params.value)
  .then(function(data){
    res.json(data);
  })
  .catch(function(reason){
    res.send(reason);
  })
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
  });

app.get("/employees", (req, res) => {
  dataService.getAllEmployees()
  .then(function(data){
    res.json(data)
  })
  .catch(function(reason){
    res.send(reason);
  })
});


app.get("/managers", (req, res) => {
  dataService.getManagers()
  .then(function(data){
    res.json(data)
  })
  .catch(function(reason){
    res.send(reason);
  })
});


app.get("/departments", (req, res) => {
  dataService.getDepartments()
  .then(function(data){
    res.json(data)
  })
  .catch(function(reason){
    res.send(reason);
  })
});


app.use((req, res) => {
  res.status(404).send("Page Not Found");
});


dataService.initialize()
.then(function(data){
  app.listen(HTTP_PORT, onHttpStart);
})
.catch(function(reason){
  console.log(reason);
})
