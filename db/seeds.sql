INSERT INTO department (name)
VALUES ("Human Resources"),
       ("Marketing"),
       ("Customer Services"),
       ("Finance");

INSERT INTO role (title, salary, department_id)
VALUES ("Recruiter", 60000, 1),
       ("Brand Manager", 90000, 2),
       ("Field Supervisor", 50000, 3),
       ("Product Makerting Manager", 90000, 2),
       ("Accountant", 70000, 4),
       ("Financial Analyst", 70000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Jennifer", "Baker", 1, null),
       ("John", "Lee", 2, null ),
       ("Lin", "Howard", 3, 1),
       ("Hugo", "Anderson", 4, 2);
       

