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

//global arrays to store employees and deparments fom ./data/employees.json & ./data/departments.json
var employees = [];
var departments = [];

var fs = require("fs");
var path = require("path");

module.exports.updateEmployee = function updateEmployee(employeeData){
    return new Promise(function(resolve, reject){
        employees.forEach((item) => {
            if (item.employeeNum == employeeData.employeeNum) {

                item.firstName = employeeData.firstName;
                item.lastName = employeeData.lastName;
                item.email = employeeData.email;
                item.addressStreet = employeeData.addressStreet;
                item.addressCity = employeeData.addressCity;
                item.addressState = employeeData.addressState;
                item.addressPostal = employeeData.addressPostal;
                item.maritalStatus = employeeData.maritalStatus;
                item.isManager = employeeData.isManager;
                item.employeeManagerNum = employeeData.employeeManagerNum;
                item.status = employeeData.status;
                item.department = employeeData.department;

                resolve();
            }
        })
    });
};

module.exports.initialize = function initialize() {
    return new Promise(function (resolve, reject) {
        fs.readFile('./data/employees.json', 'utf8', (err, data) => {
            if (err) reject("FAILED TO READ employees.json");
            employees = JSON.parse(data);

            fs.readFile('./data/departments.json', 'utf8', (err, results) => {
                if (err) reject("FAILED TO READ departments.json");
                departments = JSON.parse(results);
                resolve();
            })
        })
    });
};

module.exports.addEmployee = function addEmployee(employeeData) {
    let newEmp; //var or let
    return new Promise(function (resolve, reject) {
        if (!employeeData) reject("No Data Entered");
                                                    //constructor(empNum, fname, lname, mail, ssn, aStreet, aCity, aState, aPostal, marital, managerBool, managerNum, empStatus, dept, hdate)
        else {
            if (employeeData.isManager != undefined) {
                //can't put newEmp here???
                newEmp = new employee((employees.length + 1), employeeData.firstName, employeeData.lastName, employeeData.email, employeeData.SSN, employeeData.addressStreet, employeeData.addressCity, employeeData.addressState, employeeData.addressPostal, employeeData.maritalStatus, true, employeeData.employeeManagerNum, employeeData.status, employeeData.department, employeeData.hireDate);
                //employee class at the bottom
                //console.log(newEmp);
                employees.push(newEmp);
            }
            else {
                //can't put newEmp here???
                newEmp = new employee((employees.length + 1), employeeData.firstName, employeeData.lastName, employeeData.email, employeeData.SSN, employeeData.addressStreet, employeeData.addressCity, employeeData.addressState, employeeData.addressPostal, employeeData.maritalStatus, false, employeeData.employeeManagerNum, employeeData.status, employeeData.department, employeeData.hireDate);
                //console.log(newEmp);
                employees.push(newEmp);
                // employees.push(new employee(((employees.length+1), employeeData.firstName, employeeData.lastName, employeeData.email, employeeData.SSN, employeeData.employeeData.addressStreet, addressCity, employeeData.addressState, employeeData.addressPostal, employeeData.maritalStatus, false, employeeData.employeeManagerNum, employeeData.status, employeeData.department, employeeData.hireDate)));
            }
            resolve();
        }
    });
};


module.exports.getAllEmployees = function getAllEmployees() {
    return new Promise(function (resolve, reject) {
        //console.log(employees);
        if (employees.length == 0) reject("No Results");
        resolve(employees);
    })
}

module.exports.getEmployeesbyStatus = function getEmployeesByStatus(status) {
    let statusArray = [];
    // console.log(status);
    return new Promise(function (resolve, reject) {
        employees.forEach((item) => {
            // if(item.status == status){
            if ((item.status).toLowerCase() == status.toLowerCase()) {
                statusArray.push(item);
            }
        })
        // console.log(statusArray.length);
        if (statusArray.length === 0) reject("No Results");
        // else{
        //console.log(statusArray);
        resolve(statusArray);
        // };
    });
}


module.exports.getEmployeesbyDepartment = function getEmployeesbyDepartment(department) {
    let departmentArray = [];
    return new Promise(function (resolve, reject) {
        employees.forEach((item) => {
            if (item.department == department) {
                departmentArray.push(item);
            }
        })
        if (departmentArray.length === 0) reject("No Results");
        resolve(departmentArray);
    });
}

module.exports.getEmployeesbyManager = function getEmployeesbyManager(manager) {
    let managerArray = [];
    return new Promise(function (resolve, reject) {
        employees.forEach((item) => {
            if (item.employeeManagerNum == manager) {
                managerArray.push(item);
            }
        })
        if (managerArray.length === 0) reject("No Results");
        resolve(managerArray);
    });
}

module.exports.getEmployeebyNum = function getEmployeeByNum(num) {
    return new Promise(function (resolve, reject) {
        employees.forEach((item) => {
            if (item.employeeNum == num) {
                resolve(item);
            }
        })
        reject("No Results");
    });
}

module.exports.getDepartments = function getDepartments() {
    return new Promise(function (resolve, reject) {
        //console.log(departments);
        if (departments.length == 0) reject("No Results");
        resolve(departments);
    })
}

module.exports.getManagers = function getManagers() {
    return new Promise(function (resolve, reject) {
        var managers = [];
        for (let i = 0; i < employees.length; i++) {
            if (employees[i].isManager == true) {
                managers.push(employees[i]);
            }
        }
        if (managers.length == 0) reject("No Results");
        resolve(managers);
    })
}

class employee {
    employeeNum;
    firstName;
    lastName;
    email;
    SSN;
    addressStreet;
    addressCity;
    addressState;
    addressPostal;
    maritalStatus;
    isManager;
    employeeManagerNum;
    status;
    department;
    hireDate;

    constructor(empNum, fname, lname, mail, ssn, aStreet, aCity, aState, aPostal, marital, managerBool, managerNum, empStatus, dept, hdate) {
        this.employeeNum = empNum;
        this.firstName = fname;
        this.lastName = lname;
        this.email = mail;
        this.SSN = ssn;
        this.addressStreet = aStreet;
        this.addressCity = aCity;
        this.addressState = aState;
        this.addressPostal = aPostal;
        this.maritalStatus = marital;
        this.isManager = managerBool;
        this.employeeManagerNum = managerNum;
        this.status = empStatus;
        this.department = dept;
        this.hireDate = hdate;
    }
}