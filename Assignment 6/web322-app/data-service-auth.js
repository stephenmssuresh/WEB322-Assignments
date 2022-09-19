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

var mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
})

let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://userassignment6:passwordassignment6@web322assignment6.tjnnt.mongodb.net/web322Assignment6?retryWrites=true&w=majority");
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if (userData.password != userData.password2) {
            reject("Passwords do not match"); // reject the promise with the provided error
        }
        else {
            bcrypt.genSalt(10)
                .then(salt => bcrypt.hash(userData.password, salt))
                .then(hash => {
                    let newUser = new User(userData);
                    newUser.password = hash;
                    newUser.save((err) => {
                        if (err) {
                            if (err.code == 11000) {
                                //console.log(err);
                                reject("User Name already taken");
                            }
                            else {
                                //console.log(err);
                                reject(`There was an error creating the user: ${err}`);
                            }
                        }
                        resolve();
                    })
                    //unencrypted password storage
                    // let newUser = new User(userData);
                    // newUser.save((err) => {
                    //     if (err) {
                    //         if (err.code == 11000) {
                    //             //console.log(err);
                    //             reject("User Name already taken");
                    //         }
                    //         else {
                    //             //console.log(err);
                    //             reject(`There was an error creating the user: ${err}`);
                    //         }
                    //     }
                    //     resolve();
                    // });
                }).catch(function (err) {
                    reject("There was an error encrypting the password");
                });

        }
    });
}


module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName })
            .exec()
            .then((users) => {
                if (!users) {
                    reject(`Unable to find user: ${userData.userName}`);
                }
                else {
                    bcrypt.compare(userData.password, users[0].password)
                        .then((result) => {
                            if (result) {
                                let updateLogin = { dateTime: (new Date()).toString(), userAgent: userData.userAgent };
                                users[0].loginHistory.push(updateLogin);
                                console.log();
                                User.updateOne({ userName: users[0].userName }, { $set: { loginHistory: users[0].loginHistory } })
                                    .exec()
                                    .then(function (data) {
                                        resolve(users[0]);
                                    })
                                    .catch(function (err) {
                                        reject(`There was an error verifying the user: ${err}`);
                                    });
                            }
                            else {
                                reject(`Incorrect Password for user: ${userData.userName}`);
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            reject(`There was an error verifying the user: ${err}`)
                        });
                }
            })
            
            //unencrypted passwords
            //     else if (users[0].password != userData.password) {
            //         reject(`Incorrect Password for user: ${userData.userName}`);
            //     }
            // //     else {

            //         let updateLogin = { dateTime: (new Date()).toString(), userAgent: userData.userAgent };
            //         users[0].loginHistory.push(updateLogin);
            //         console.log();
            //         User.updateOne({ userName: users[0].userName }, { $set: { loginHistory: users[0].loginHistory } })
            //             .exec()
            //             .then(function (data) {
            //                 resolve(users[0]);
            //             })
            //             .catch(function (err) {
            //                 reject(`There was an error verifying the user: ${err}`);
            //             });
            //     };
            // })
            .catch((err) => {
                console.log(err);
                reject(`Unable to find user: ${userData.userName}`)
            });
    });
};

