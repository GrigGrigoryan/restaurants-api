# Restaurants backend rest api

* Before get started create `.env` file by `.env.example`
* Run `npm install`
* Migrate database using command. `sequelize-cli db:migrate`
* Run server with `npm start` or `npm run dev`
* Create super_admin user.
#####
#### `/users`
POST
* `headers: {user_secret}`
* `body: {first_name, last_name, email, password, repeat_password}`
###

# What has been done 

* Designed flexible and expandable project structure
* Added jwt authentication 
* Added routes with middlewares create read update delete by roles
* Added sequelize module to work with mysql, sqlite
* Data multiple manipulating made with transactions to avoid conflicts when making requests at the same time to same table

# /API Requests
#### Use Postman for requests

#### `/`
GET
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
###

#### `/register`
POST
* `body: {first_name, last_name, email, password, repeat_password}`
###

#### `/login`
POST 
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* `body: {first_name, last_name}`
###

#### `/logout`
POST
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
###

#### `/meals` 
GET 
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* Filter `/meals?type=&name=&description=&price=`
* Sort `/meals?type_sort=&name_sort=&description_sort=&price_sort=`
####
use `ASC` and `DESC` to sort them by Ascending or descending order
####
POST 
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* `body: {type, name, description, price}`
###

#### `/meals/:meal_id` 
GET 
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
####
PUT 
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* `body: {type, name, description, price}`
####
DELETE
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
###

#### `/restaurants`
GET 
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* Filter `/restaurants?name=&meals_type=`
* Sort `/restaurants?name_sort=&meals_type_sort=`
####
use `ASC` and `DESC` to sort them by Ascending or descending order
####
POST 
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* `body: {name, meals_type}`

#### `/restaurants/:restaurant_id`
GET
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
####
PUT
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* `body: {name, meals_type}`
####
DELETE
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
###

#### `/users`
GET 
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* Querying `/users?first_name=&last_name=email=`
####
POST 
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* `body: {super_admin_secret, first_name, last_name, email, password, repeat_password, role_id, permissions_ids(1,2,3,4,5)}`

#### `/users/:user_id`
GET
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
####
PUT
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* `body: {first_name, last_name, email}`
####
DELETE
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
###

#### `/users/:user_id/roles`
GET
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
###

#### `/users/:user_id/roles/:role_id`
GET
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
###
POST
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
####
DELETE
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
###

#### `/users/:user_id/permissions`
GET
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
####

#### `/users/:user_id/permissions/:permission_id`
GET
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
####
POST
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
####
DELETE
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
###

#### `/roles`
GET
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* Querying `/roles?name=&is_active=`
####
POST
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
###

#### `/roles/:role_id`
GET
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
####
POST
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
####
PUT
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* `body: {name, is_active(true,false)}`
####
DELETE
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
###

#### `/permissions`
GET
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* Querying `/permissions?name=&is_active=`
####
POST
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
###

#### `/permissions/:permission_id`
GET
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
####
POST
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
####
PUT
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
* `body: {name, is_active(true,false)}`
####
DELETE
* `headers: {authorization: "Bearer <YOUR TOKEN>"}`
###

##

# About

this api made by using improved routes and middleware system to make code more flexible and expandable
###
improved error handling and sort in development and production