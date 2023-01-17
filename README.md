# HRSpace User Stories

####  HRSpace is a human resources platform that supports HR in the employees' database management and paperwork process with an ease.

### User Story
HRSpace's target users are Human Resources employees who have to deal with a huge amount of paperwork and employee's information accumulation. With just a name, an email, a password, and a company name, each user can register an account as the admin for that company. Email and company are unique among the users of the platforms. 

There are 3 user roles in the platform: Admin, Manager, and Employee. While the ADMIN can access all pages, the other roles can access the allowed information.


| No.        | Manager| Employee| 
| --------  | -------- | -------- |
| Employees List| Can see employees' list under manager's management| Can not     |
| Information| Can see employees' info under manager's management     | Can see employee's info only    |
| Review| Can see employees' reviews under manager's management     | Can see employee's review only    |
| Paperwork| Can not view employees' paperwork     | Can see employee's paperwork only    |


After logging in HRSpace, based on their roles, users can see a list of employees that created in the database and paginate among the list. Besides, users can search employees by name or filter by status, department, employment type.

If there's no employee yet, admins can create new employee by providing the requested information like name, onboarding date, department, etc. 

By accessing employee detailed page, admin users can view or edit employees information. Paperwork section is the place for users to check paperwork status and generate a new paperwork in accordance with provided employee's data.

When any paperwork created successfully, a related review for that paperwork will be automatically generated. This Review section is all for paperwork renew consideration. Admins can share the review by themeselves to remind the manager on review conduction.

##### AUTHENTICATION
- [ ] As a user, I can sign in with my email and password
- [ ] As a user, I can use Gmail to login
- [ ] As a user, I can register a new account with name, email, password, and company name or with Gmail
- [ ] After signing up, I must verify my email via the verification email sent to my registered mail
- [ ] As a user, I can sign in using Gmail
- [ ] As a user, I can stay sign in after page refresh


##### EMPLOYEES - ADMIN ROLE
- [ ] As an admin, I can see lists of employees database that I or other company admins created. 
- [ ] As an admin, I can search employees by name and filter by department, employment status, employment types
- [ ] As an admin, I can create single employee at a time or create in bulk
- [ ] As an admin, I can update employees' info or delete an employee (but can not delete myself)

##### EMPLOYEES - MANAGER ROLE
- [ ] As a manager, I can see lists of the employees under my management.
- [ ] As a manager, I can search my employees by name and filter them as well.
- [ ] As a manager, I can see my employees' detailed information, excluding their salaries.

##### EMPLOYEES - EMPLOYEE ROLE
- [ ] As an employee, I can see only me in the employee list.
- [ ] As a staff, I can see my detailed info.

##### PAPERWORKS 
- [ ] As an admin, I can create a paperwork along with the review at the same time.
- [ ] As an admin, I can view or delete a paperwork
- [ ] As an admin, I can see the paperwork list of a specific employee.
- [ ] As an admin, I can quickly update paperwork status and upload PDF paperwork to my Drive.
- [ ] As an admin, I can generate a paperwork into PDF and download it.
- [ ] As an employee, I can see all my paperwork.
- [ ] As a manager, I can see my paperwork only, not other people.

##### REVIEWS - ADMIN ROLE
- [ ] As an admin, I can see the list of generated review
- [ ] As an admin, I can search available review by its title or filter by status.
- [ ] As an admin, I can create new review
- [ ] As an admin, I can view, share, or delete an available review

##### REVIEWS - EMPLOYEE ROLE
- [ ] As an employee, I can see the list of my review
- [ ] As an employee, I can have a detailed look at my review and its result

##### REVIEWS - MANAGER ROLE
- [ ] As a manager, I can see all the reviews of employees that I managed
- [ ] As a manager, I can see access and evaluate my employees' review
- [ ] As a manager, I can search review by title or filter by status

##### TEMPLATES - ADMIN ROLE


### API Endpoints
##### AUTH APIs
````javascript
* @route POST /auth/login
* @description Login with username and password
* @body {email, passsword}
* @access Public
````

````javascript
 * @route POST /auth/loginWithGmail
 * @description Login with Gmail
 * @body {email, email_verified}
 * @access Public
````

````javascript
 * @route POST /auth/verification/:confirmationCode
 * @description Verify email
 * @body {confirmationCode}
 * @access Private
````

##### USERS APIs
````javascript
 * @route POST /users/register
 * @description Register a new user
 * @body {name, email, password, companyName}
 * @access Public
````

````javascript
 * @route GET /users
 * @description Get user list
 * @body {page, limit, searchName, filter}
 * @access Login Required, Admin Only
````

````javascript
 * @route POST /users/activate
 * @description Activate a user
 * @body {email, password}
 * @params {id}
 * @access Login Required, Admin Only
````

````javascript
 * @route PUT /users/reset
 * @description Reset password
 * @body {email, password}
 * @params {id}
 * @access Login Required, Admin Only
````

````javascript
 * @route DELETE /users
 * @description Reset password
 * @params {id}
 * @access Login Required, Admin Only
````

##### EMPLOYEES APIs
````javascript
 * @route POST /employees/
 * @description Create an employee
 * @body {name, email, role }
 * @access Login Required, Admin Only
````

````javascript
 * @route POST /employees/upload
 * @description Create many employees via file
 * @header {accessToken}
 * @access Login Required, Admin Only
````

````javascript
 * @route GET /employees&page=0&limit=10?name=
 * @description Get list of employees based on current employee role
 * @query {page, limit, name, department, employmentStatus, employmentTypes }
 * @header {accessToken}
 * @access Login Required
````

````javascript
 * @route GET /employees/:id
 * @description See an employee information
 * @query {id}
 * @header {accessToken}
 * @access Login Required
````

````javascript
 * @route PUT /employees/:id
 * @description Update an employee profile
 * @body {name, email, company,... }
 * @access Login Required, Admin Only
````

````javascript
 * @route DELETE /employees/:id
 * @description Delete an employee
 * @params {id }
 * @access Login Required, Admin Only
````

##### PAPERWORKS APIS
````javascript
 * @route GET /paperwork/:id (EmployeeID)
 * @description Get paperwork list of a specific employee
 * @header {accessToken}
 * @access Login Required
````

````javascript
 * @route GET /paperwork/:id/:idPaper
 * @description Get a paperwork details
 * @header {accessToken}
 * @access Login Required, Admin and Current EmployeeID Only
````

````javascript
 * @route POST /paperwork/:id
 * @description Create a paperwork
 * @header {accessToken}
 * @access Login Required, Admin Only
````

````javascript
 * @route PUT /paperwork/:id/:idPaper
 * @description Update a paperwork
 * @header {accessToken}
 * @access Login Required, Admin Only
````

````javascript
 * @route DELETE /paperwork/:id/:idPaper
 * @description Delete a paperwork
 * @header {accessToken}
 * @access Login Required, Admin Only
````

##### REVIEWS APIS
````javascript
 * @route POST /reviews/:id
 * @description Create a review
 * @header {accessToken}
 * @access Login Required, Admin Only
````

````javascript
 * @route GET /reviews/:id?page=0&limit=10
 * @description Get review list of a specific employee
 * @header {accessToken}
 * @access Login Required
````

````javascript
 * @route GET /reviews/:id/:reviewId
 * @description Get a review
 * @query {id, reviewId}
 * @header {accessToken}
 * @access Login Required
````

````javascript
 * @route PUT /reviews/:id/:reviewId
 * @description Update a review
 * @query {id, reviewId}
 * @header {accessToken}
 * @access Login Required, Admin and Manager
````

````javascript
 * @route POST /reviews/:id/:reviewId
 * @description Share a review
 * @query {id, reviewId}
 * @header {accessToken}
 * @access Login Required, Admin Only
````

````javascript
 * @route DELETE /reviews/:id/:reviewId
 * @description Delete a review
 * @params {id, reviewId }
 * @access Login Required, Admin Only
````

##### TEMPLATES
````javascript
 * @route POST /templates
 * @description Create new template
 * @header {accessToken}
 * @access Login Required, Admin Only
````

````javascript
 * @route GET /templates
 * @description Get Template List
 * @header {accessToken}
 * @access Login Required
````

````javascript
 * @route GET /templates/:templateId
 * @description Get Single Template
 * @header {accessToken}
 * @access Login Required
````

````javascript
 * @route PUT /template/:templateId
 * @description Update a template
 * @header {accessToken}
 * @access Login Required, Admin Only
````

````javascript
 * @route DELETE /templates/:templateId
 * @description Delete a template
 * @header {accessToken}
 * @access Login Required, Admin Only
````


### Diagram Entity
![](https://i.imgur.com/Raq9z1U.png)

