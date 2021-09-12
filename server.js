// require dependencies
const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
const dotenv = require('dotenv').config();

const PORT = process.env.PORT || 3001;

// connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD,
        database: 'business_db'
    },
    console.log('Connected to business_db database.')
);

db.connect(function(err) {
    if (err) throw err
    console.log('connected as Id' + db.threadId)
});

function startPrompt() {
    inquirer.prompt([
        {
        type: "list",
        message: "What would you like to do?",
        name: "options",
        choices: [
                    "View All Departments?",
                    "View All Roles?",
                    "View All Employee?",
                    "Add a Department?",
                    "Add a Role?",
                    "Add an Employee?",
                    "Update an Employee Role?",
                    "Quit",
                 ]
        }
    ]).then(function(val) {
        switch (val.options) {
            case 'View All Departments?':
                viewAllDepartments();
                break;

            case 'View All Roles?':
                viewAllRoles();
                break;

            case 'View All Employee?':
                viewAllEmployee();
                break;

            case 'Add a Department?':
                addDepartment();
                break;

            case 'Add a Role?':
                addRole();
                break;

            case 'Add an Employee?':
                addEmployee();
                break;

            case 'Update an Employee Role?':
                updateEmployee();
                break;

            case 'Quit':
                quit();
                break;
        }

    })
}

// view all departments
function viewAllDepartments() {
    const sql = `SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;`;
    db.query(sql, function(err, res) {
        if (err) throw err
        console.table(res)
        startPrompt()
    })
}

// view all employee
function viewAllEmployee() {
    const sql = `SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;`;
    db.query(sql, function(err, res) {
        if (err) throw err
        console.table(res)
        startPrompt()
    })
}

// view all roles
function viewAllRoles() {
    const sql =`SELECT employee.first_name, employee.last_name, role.title AS Title FROM employee JOIN role ON employee.role_id = role.id;`;
    db.query(sql, function(err, res) {
        if (err) throw err
        console.table(res)
        startPrompt()
    })
}

// 
var roleArray = [];
function selectRole() {
    db.query("SELECT * FROM role", function(err, res) {
        if (err) throw err
        for (var i = 0; i < res.length; i++) {
        roleArray.push(res[i].title);
        }

    })
    return roleArray;
}

// 
var managersArray = [];
function selectManager() {
    db.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL", function(err, res) {
        if (err) throw err
        for (var i = 0; i < res.length; i++) {
        managersArray.push(res[i].first_name);
        }

    })
    return managersArray;
}

// Add employee
function addEmployee() {
    inquirer.prompt([
        {
            name: 'firstName',
            type: 'input',
            message: 'Employee first name'
        },
        {
            name: 'lastName',
            type: 'input',
            message: 'Employee last name'
        },
        {
            name: 'role',
            type: 'list',
            message: 'What is employee role?',
            choices: selectRole()
        },
        {
            name: 'manager',
            type: 'rawlist',
            message: 'What is their manager name?',
            choices: selectManager()
        }
    ]).then(function (val) {
        var roleId = selectRole().indexOf(val.role) + 1
        console.log(val)
        var managerId = selectManager().indexOf(val.options) + 2
        console.log(roleId)
        console.log(managerId)
        db.query("INSERT INTO employee SET ?",
        {
            first_name: val.firstName,
            last_name: val.lastName,
            manager_id: managerId,
            role_id: roleId
        }, function (err){
            if (err) throw err
            console.table(val)
            startPrompt()
        }
        )
    })
}

// update employee
function updateEmployee() {
    db.query("SELECT employee.last_name, role.title FROM employee JOIN role ON employee.role_id = role.id;", function(err, res) {
        if (err) throw err
        console.log(res)
        inquirer.prompt([
            {
                name: "lastName",
                type: "rawlist",
                choices: function() {
                    var lastName = [];
                    for (var i = 0; i < res.length; i++) {
                        lastName.push(res[i].last_name);
                    }
                    return lastName;
                },
                message: "What is the Employee's last name?",
            },
            {
                name: "role",
                type: "rawlist",
                message: "What is the Employee's new title?",
                choices: selectRole()
            },
        ]).then(function(val) {
            console.log(val)
            var roleId = selectRole().indexOf(val.role) + 1
            console.log(roleId)
            db.query("UPDATE employee SET role_id = ? WHERE last_name = ?", [roleId, val.lastName],
            function(err) {
                if (err) throw err
                console.table(val)
                startPrompt()
                }
            )
        })
    });
}

// add employee role 
function addRole() { 
    db.query("SELECT role.title AS Title, role.salary AS Salary FROM role",   function(err, res) {
      inquirer.prompt([
          {
            name: "Title",
            type: "input",
            message: "What is the roles Title?"
          },
          {
            name: "Salary",
            type: "input",
            message: "What is the Salary?"
  
          } 
      ]).then(function(res) {
          db.query(
              "INSERT INTO role SET ?",
              {
                title: res.Title,
                salary: res.Salary,
              },
              function(err) {
                  if (err) throw err
                  console.table(res);
                  startPrompt();
              }
          )
  
      });
    });
}

// add department
function addDepartment() { 
    inquirer.prompt([
        {
          name: "name",
          type: "input",
          message: "What Department would you like to add?"
        }
    ]).then(function(res) {
        db.query("INSERT INTO department SET ? ",
            {
              name: res.name
            },
            function(err) {
                if (err) throw err
                console.table(res);
                startPrompt();
            }
        )
    })
}

function quit() {
    process.quit()
}

startPrompt();