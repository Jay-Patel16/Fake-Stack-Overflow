
## Instructions to setup and run project

## Team Member 1 Contribution
(Name: Jay Patel)

- Login Page
- Register Page
- Session and Authentication
- Backend connection to server for updating, deleting, voting - questions and answers and comments
- Backend connection to server for profile page, admin page
- Updating and deleting tags in user profile

## Team Member 2 Contribution

(Name: Antony Shen)

- Welcome Page
- Front End for comments, voting, pagination for questions/answers/comments, profile page, and admin page
- Created Tags user story in profile page
- Answered Questions user story in profile page
- Backend connection to server for admin page
- Routing for pages via buttons and changes


_____________________________________________________________________________________________________________________________________________________________________________________________________________________

Starting Procedure:

To start - clone the repository to your local system (follow below steps in order)

- Make sure to have `mongod` installed to be able to start the application
- `cd` into the folder that has the repository stored on local system
- With three command terminal opens with the route to the repository  - one will be for starting the website and two will be for starting the server
- In one server terminal - To start type `cd server` to get into the server folder and type `npm install` to install all the needed libraries.
- In the client terminal - To start type `cd client` to get into the client folder and type `npm install` and `npm install axios` after to install all needed libraries
- Open up the other server terminal (cd to repository) type `mongod`
- After this in the original server terminal type `npm start 'Write the secret key for the session'` (replace 'write the secret key for the session' with your own secret string for session such as `npm start secretKey`)
- If you would like to populate the database with data, please refer below and follow the instructions and then come back here

- After this in the client terminal type `npm start` (website should shortly open on browser)
- You will then be granted with a three options of - register new user, sign in existing user, and sign in guest user
- Feel Free to choose your option - Guest vs Existing User have Restrictions compared to each other expressed below. 


Restrictions:

- Guest User are not allowed to vote, comment, answer questions, post questions, or view profile page. However, are able to search for questions and view everything else. (To have a search go through, press enter after typing in your inputs)

- Logged In users are allowed everything that is present for them - (for searching, comments, or editing tags - after writing the changes/response - press enter to have the process to go through)

_____________________________________________________________________________________________________________________________________________________________________________________________________________________

For populating base data

- To populate the data (different terminal in the server folder), run `node init.js <username> <password>` this will set up the admin profile with the username and password provided - the ADMIN Email is : "admin@gmail.com"
- The admin email and password will be used to log in as admin on the website

- Users that are used to populate the database have reputation points of 50 already but new ones will start with 0.
- User in data Info - email, username, password
- User 1: cs@gmail.com, ghost, Gtr
- User 2: marvel@gmail.com, apex, legends?
- User 3: gaming@gmail.com, redline, rpm123

