/*********************************************************************************
* WEB322 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Stephen Suresh    Student ID: 117916213     Date: March 4, 2022
*
* Online (Heroku) Link: https://peaceful-waters-49104.herokuapp.com/
*
********************************************************************************/

const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require('body-parser');
const fs = require("fs");
const multer = require('multer');
const dataService = require('./data-service.js');

//handlebars template engine
const exphbs = require('express-handlebars');

app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {

    //helper highlights the navbar element if user is on the url the element takes you to
    navLink: function (url, options) {
      return '<li' +
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },


    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }
  }
}));
app.set('view engine', '.hbs');


const urlencodedParser = bodyParser.urlencoded({ extended: true });
const storage = multer.diskStorage({
  destination: './public/images/uploaded/',
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
})

const upload = multer({ storage: storage });

const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));


app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next();
});

app.post("/employee/update", urlencodedParser, (req, res) => {
  console.log(req.body);
  dataService.updateEmployee(req.body)
  .then(()=>{
    res.redirect("/employees");
  });
});

app.get("/images/add", (req, res) => {
  res.render('addImage', {
    layout: "main"
  })
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect('/images')
});

app.get('/images', (req, res) => {
  fs.readdir((__dirname + '/public/images/uploaded'), (err, items) => {
    //var images = { images: items };
    //var images = items;
    //console.log(images);
    res.render('images', {
      data: items
    });
  });
});

app.get("/employees", (req, res) => {
  //limitation: can only handle 1 query string at a time
  if (req.query.status) {
    //status
    // console.log(req.query.status);
    dataService.getEmployeesbyStatus(req.query.status)
      .then(function (data) {
        res.render('employees', {
          data: data
        });
      })
      .catch(function (reason) {
        res.render('employees', {
          message: reason
        });
      });
  }
  else if (req.query.department) {
    //department
    dataService.getEmployeesbyDepartment(req.query.department)
      .then(function (data) {
        res.render('employees', {
          data: data
        });
      })
      .catch(function (reason) {
        res.render('employees', {
          message: reason
        });
      });
  }
  else if (req.query.manager) {
    //employeeManagerNum
    dataService.getEmployeesbyManager(req.query.manager)
      .then(function (data) {
        res.render('employees', {
          data: data
        });
      })
      .catch(function (reason) {
        res.render('employees', {
          message: reason
        });
      });
  }
  else {
    dataService.getAllEmployees()
      .then(function (data) {
        res.render('employees', {
          data: data
          //layout: "main"
        });
      })
      .catch(function (reason) {
        res.render('employees', {
          message: reason
        });
      });
  };
});

app.post('/employees/add', urlencodedParser, (req, res) => {
  //console.log(req.body);
  dataService.addEmployee(req.body)
    .then(() => {
      res.redirect('/employees');
    })
    .catch(function (reason) {
      res.render('employees', {
        message: reason
      });
    });
});

app.get("/employees/add", (req, res) => {
  res.render('addEmployee', {
    layout: "main"
  })
});

app.get("/employee/:value", (req, res) => {
  dataService.getEmployeebyNum(req.params.value)
    .then(function (data) {
      res.render('employee', {
        employee: data
      });
    })
    .catch(function (reason) {
      res.render("employee", { message: "no results" });
    })
});

app.get("/", (req, res) => {
  //res.sendFile(path.join(__dirname, "/views/home.html"));
  res.render('home', {
    layout: "main"
  })
});

app.get("/about", (req, res) => {
  res.render('about', {
    layout: "main"
  })
});

// not using this route anymore
// app.get("/managers", (req, res) => {
//   dataService.getManagers()
//     .then(function (data) {
//       res.json(data)
//     })
//     .catch(function (reason) {
//       res.send(reason);
//     })
// });


app.get("/departments", (req, res) => {
  dataService.getDepartments()
    .then(function (data) {
      //console.log(data);
      res.render('departments', {
        data: data
      });
    })
    .catch(function (reason) {
      res.render('departments', {
        message: reason //just in case
      });
    })
});


app.use((req, res) => {
  res.status(404).send("Page Not Found");
});


dataService.initialize()
  .then(function (data) {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch(function (reason) {
    console.log(reason);
  })
