/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Stephen Suresh    Student ID: 117916213     Date: March 24, 2022
*
* Online (Heroku) Link: https://mysterious-brook-38868.herokuapp.com/
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
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.status(500).send("Unable to Update Employee");
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
    res.render('images', {
      data: items
    });
  });
});

app.get("/employees", (req, res) => {
  if (req.query.status) {
    // status
    // console.log(req.query.status);
    dataService.getEmployeesbyStatus(req.query.status)
      .then(function (data) {
        if (data.length > 0) {
          res.render('employees', {
            data: data
            //layout: "main"
          });
        }
        else {
          res.render('employees', {
            message: "No Results"
          });
        };
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
        if (data.length > 0) {
          res.render('employees', {
            data: data
            //layout: "main"
          });
        }
        else {
          res.render('employees', {
            message: "No Results"
          });
        };
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
        if (data.length > 0) {
          res.render('employees', {
            data: data
            //layout: "main"
          });
        }
        else {
          res.render('employees', {
            message: "No Results"
          });
        };
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
        if (data.length > 0) {
          res.render('employees', {
            data: data
            //layout: "main"
          });
        }
        else {
          res.render('employees', {
            message: "No Results"
          });
        };
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
  dataService.getDepartments()
    .then((data) => {
      res.render('addEmployee', {
        layout: "main",
        departments: data
      });
    })
    .catch((err) => {
      res.render('addEmployee', {
        layout: "main",
        departments: []
      });
    });
});

app.get("/employee/:empNum", (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};

  dataService.getEmployeebyNum(req.params.empNum)
    .then(function (data) {
      if (data) {
        viewData.employee = data;  //store employee data in the "viewData" object as "employee"
      }
      else {
        viewData.employee = null; // set employee to null if none were returned from getEmployeebyNum()
      }
    })
    .catch(function () {
      viewData.employee = null; // set employee to null if there was an error in calling getEmployeebyNum()
    })
    .then(function () {  // then call getDepartments to pass into the drop down select
      dataService.getDepartments()
        .then(function (data) {
          viewData.departments = data; // store department data in the "viewData" object as "departments"

          // loop through viewData.departments and once we have found the departmentId that matches
          // the employee's "department" value, add a "selected" property to the matching
          // viewData.departments object
          for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
              viewData.departments[i].selected = true;
              //break;
            };
          };
        })
        .catch(function () {
          viewData.departments = []; // set departments to empty if there was an error calling getDepartments()
        })
        .then(function () {
          if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
          }
          else {
            res.render("employee", { data: viewData }); // render the "employee" view, passing viewData
          };
        });
    })
    .catch((err) => {
      res.status(500).send("Unable to retrieve Employee");
    });
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


app.get("/departments", (req, res) => {
  dataService.getDepartments()
    .then(function (data) {
      if (data.length > 0) {
        res.render('departments', {
          data: data
        });
      }
      else {
        res.render('departments', {
          message: "No Results"
        })
      }
    })
    .catch(function (reason) {
      res.render('departments', {
        message: reason //just in case
      });
    })
});

app.get("/departments/add", (req, res) => {
  res.render('addDepartment', {
    layout: "main"
  })
});

app.post("/departments/add", urlencodedParser, (req, res) => {
  dataService.addDepartment(req.body)
    .then(function () {
      res.redirect("/departments");
    })
    .catch(function (reason) {
      res.render('departments', {
        message: reason
      });
    });
});

app.post("/department/update", urlencodedParser, (req, res) => {
  console.log(req.body);
  dataService.updateDepartment(req.body)
    .then(function () {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.status(500).send("Unable to Update Department");
    });
});

app.get("/department/:departmentId", (req, res) => {
  dataService.getDepartmentById(req.params.departmentId)
    .then(function (data) {
      if (data == undefined) res.status(404).send("Page Not Found");
      res.render('department', {
        department: data
      });
    }).catch(function (error) {
      // res.render('department', {message: error});
      res.status(404).send("Page Not Found");
    });
});

app.get("/department/delete/:departmentId", (req, res) => {
  dataService.deleteDepartmentById(req.params.departmentId)
    .then(function () {
      res.redirect("/departments");
    })
    .catch(function (reason) {
      res.status(500).send("Unable to Remove Department / Department not found)")
    });
});

app.get("/employees/delete/:empNum", (req, res) => {
  dataService.deleteEmployeeByNum(req.params.empNum)
    .then(function () {
      res.redirect("/employees");
    })
    .catch(function (reason) {
      res.status(500).send("Unable to Remove Employee / Employee not found)");
    });
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

dataService.initialize()
  .then(function (data) {
    console.log(data);
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch(function (reason) {
    console.log(reason);
    //app.listen(HTTP_PORT, onHttpStart); //should've put this too
  })

