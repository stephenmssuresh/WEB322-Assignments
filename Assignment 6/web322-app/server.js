/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Stephen Suresh    Student ID: 117916213     Date: April 22, 2022
*
* Online (Heroku) Link: https://stormy-shore-02433.herokuapp.com/
*
********************************************************************************/



//userassignment6
//passwordassignment6

const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require('body-parser');
const fs = require("fs");
const multer = require('multer');
const dataService = require('./data-service.js');
const dataServiceAuth = require('./data-service-auth.js');
const clientSessions = require("client-sessions");

const urlencodedParser = bodyParser.urlencoded({ extended: true });

app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "web322_assignment6", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60// the session will be extended by this many ms each request (1 minute)
}));

app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");

  } else {
    next();
  }
};

app.get("/login", (req, res) => {
  res.render('login', {
    layout: "main"
  })
});

app.get("/register", (req, res) => {
  res.render('register', {
    layout: "main"
  })
});

app.post("/register", urlencodedParser, (req, res) => {
  dataServiceAuth.registerUser(req.body)
    .then((data) => {
      res.render('register', {
        data: { successMessage: "User created" }
      });
    })
    .catch((err) => {
      res.render('register', {
        data: { errorMessage: err, userName: req.body.userName }
      });
    });
});

app.post("/login", urlencodedParser, (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  dataServiceAuth.checkUser(req.body)
    .then((data) => {
      req.session.user = {
        userName: data.userName, // authenticated user's userName
        email: data.email,// authenticated user's email
        loginHistory: data.loginHistory// authenticated user's loginHistory
      }
      res.redirect('/employees');
    })
    .catch((err) => {
      res.render('login', {
        data: { errorMessage: err, userName: req.body.userName }
      });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render('userHistory', {
    layout: "main"
  })
});

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

app.post("/employee/update", urlencodedParser, ensureLogin, (req, res) => {
  //.log(req.body);
  dataService.updateEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.status(500).send("Unable to Update Employee");
    });
});

app.get("/images/add", ensureLogin, (req, res) => {
  res.render('addImage', {
    layout: "main"
  })
});

app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
  res.redirect('/images')
});

app.get('/images', ensureLogin, (req, res) => {
  fs.readdir((__dirname + '/public/images/uploaded'), (err, items) => {
    res.render('images', {
      data: items
    });
  });
});

app.get("/employees", ensureLogin, (req, res) => {
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

app.post('/employees/add', urlencodedParser, ensureLogin, (req, res) => {
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

app.get("/employees/add", ensureLogin, (req, res) => {
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

app.get("/employee/:empNum", ensureLogin, (req, res) => {
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
            res.render("employee", { viewData: viewData }); // render the "employee" view, passing viewData
          };
        });
    })
    .catch((err) => {
      res.status(500).send("Unable to retrieve Employee");
    });
});

app.get("/", (req, res) => {
  //console.log(req.session.user);
  res.render('home', {
    layout: "main"
  })
});

app.get("/about", (req, res) => {
  res.render('about', {
    layout: "main"
  })
});


app.get("/departments", ensureLogin, (req, res) => {
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

app.get("/departments/add", ensureLogin, (req, res) => {
  res.render('addDepartment', {
    layout: "main"
  })
});

app.post("/departments/add", urlencodedParser, ensureLogin, (req, res) => {
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

app.post("/department/update", urlencodedParser, ensureLogin, (req, res) => {
  //console.log(req.body);
  dataService.updateDepartment(req.body)
    .then(function () {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.status(500).send("Unable to Update Department");
    });
});

app.get("/department/:departmentId", ensureLogin, (req, res) => {
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

app.get("/department/delete/:departmentId", ensureLogin, (req, res) => {
  dataService.deleteDepartmentById(req.params.departmentId)
    .then(function () {
      res.redirect("/departments");
    })
    .catch(function (reason) {
      res.status(500).send("Unable to Remove Department / Department not found)")
    });
});

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
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
  .then(dataServiceAuth.initialize())
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT);
    });
  })
  .catch(function (err) {
    console.log("unable to start server: " + err);
  })

