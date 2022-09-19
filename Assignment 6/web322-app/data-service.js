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

const Sequelize = require('sequelize');

var sequelize = new Sequelize('dftajee4fov74t', 'ynoeamjosruuih', '27d2be02d8ee669b8155034a37811dedbf5649a0d6518f1b39dd7c5ff41621fa', {
    host: 'ec2-54-160-109-68.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true } //needed to work with handlebars
});

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

Department.hasMany(Employee, { foreignKey: 'department' });

module.exports.initialize = function initialize() {
    return new Promise(function (resolve, reject) {
        sequelize.sync()
            .then(function () {
                resolve("Sync successful")
            })
            .catch(function () {
                reject("Unable to sync to the database")
            });
    })
};

module.exports.getAllEmployees = function getAllEmployees() {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            order: ['employeeNum']
        })
            .then(function (data) {
                resolve(data);
            })
            .catch(function () {
                reject("No Results Returned");
            });
    });
};

module.exports.getEmployeesbyStatus = function getEmployeesByStatus(empStatus) {
    return new Promise(function (resolve, reject) {
        //console.log(empStatus);
        Employee.findAll({
            order: ['employeeNum'],
            where: {
                status: empStatus
            }
        }).then(function (data) {
            //console.log(data);
            resolve(data);
        }).catch(function (err) {
            //console.log(err);
            reject("No Results Returned");
        })
    });
};

module.exports.getEmployeesbyDepartment = function getEmployeesbyDepartment(empDepartment) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            order: ['employeeNum'],
            where: {
                department: empDepartment
            }
        }).then(function (data) {
            resolve(data);
        }).catch(function () {
            reject("No Results Returned");
        })
    });
};

module.exports.getEmployeesbyManager = function getEmployeesbyManager(manager) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            order: ['employeeNum'],
            where: {
                employeeManagerNum: manager
            }
        }).then(function (data) {
            resolve(data);
        }).catch(function () {
            reject("No Results Returned");
        })
    });
};

module.exports.getEmployeebyNum = function getEmployeeByNum(num) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                employeeNum: num
            }
        }).then(function (data) {
            resolve(data[0]);
        }).catch(function () {
            reject("No Results Returned");
        })
    });
};

module.exports.getDepartments = function getDepartments() {
    return new Promise(function (resolve, reject) {
        Department.findAll({
            order: ['departmentId']
        })
            .then(function (data) {
                resolve(data);
            })
            .catch(function () {
                reject("No Results Returned");
            });
    });
};

module.exports.addEmployee = function addEmployee(employeeData) {
    return new Promise(function (resolve, reject) {
        // console.log(employeeData);
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (var properties in employeeData) {
            if (properties == "") properties = null;
        }
        Employee.create({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            hireDate: employeeData.hireDate,
            department: employeeData.department
        })
            .then(function () {
                resolve("Employee successfully added")
            })
            .catch(function () {
                reject("Unable to add employee");
            })

    });
};

module.exports.updateEmployee = function updateEmployee(employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (var properties in employeeData) {
            if (properties == "") properties = null;
        }
        Employee.update({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            hireDate: employeeData.hireDate,
            department: employeeData.department
        }, {
            where: { employeeNum: employeeData.employeeNum }
        })
            .then(function (data) {
                //console.log(data);
                resolve("Employee successfully updated")
            })
            .catch(function (err) {
                //console.log(err);
                reject("Unable to update employee");
            })
    });
};

module.exports.addDepartment = function addDepartment(departmentData) {
    return new Promise(function (resolve, reject) {
        for (var properties in departmentData) {
            if (properties == "") properties = null;
        }
        //console.log(departmentData.departmentName);
        Department.create({
            departmentName: departmentData.departmentName
        })
            .then(function (data) {
                //console.log(data);
                resolve("Department successfully create");
            })
            .catch(function (err) {
                //console.log(err);
                reject("Unable to create department");
            })
    });
};

module.exports.updateDepartment = function updateDepartment(departmentData) {
    return new Promise(function (resolve, reject) {
        for (var properties in departmentData) {
            if (properties == "") properties = null;
        }
        //console.log(departmentData);
        Department.update({
            departmentName: departmentData.departmentName
        }, {
            where: { departmentId: departmentData.departmentId }
        })
            .then(function (data) {
                //console.log(data);
                resolve("Department successfully updated");
            })
            .catch(function (err) {
                //console.log(err);
                reject("Unable to update department");
            })
    });
};

module.exports.getDepartmentById = function getDepartmentById(id) {
    return new Promise(function (resolve, reject) {
        Department.findAll({
            where: {
                departmentId: id
            }
        }).then(function (data) {
            resolve(data[0]);
        }).catch(function () {
            reject("No Results Returned");
        })
    });
};

module.exports.deleteDepartmentById = function deleteDepartmentById(id) {
    return new Promise(function (resolve, reject) {
        //console.log(id)
        Department.destroy({
            where: {
                departmentId: id
            }
        }).then(function () {
            resolve("Department successfully deleted");
        }).catch(function (err) {
            // console.log(err);
            reject("Unable to delete department");
        })
    });
};

module.exports.deleteEmployeeByNum = function deleteEmployeeByNum(empNum){
    return new Promise(function (resolve, reject) {
        Employee.destroy({
            where: {
                employeeNum: empNum
            }
        }).then(function () {
            resolve("Employee successfully deleted");
        }).catch(function (err) {
            // console.log(err);
            reject("Unable to delete employee");
        })
    });
}