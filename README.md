<h1 align="center" id="title">🎉  Voting API  🎉</h1>

This Voting API allows users to register and log in using their Aadhar card numbers. Users can view a list of candidates and cast their votes, with the restriction that each user can vote only once. The API also provides live vote counts for candidates, displayed in sorted order. An admin can manage the candidate list but is not permitted to vote. Additionally, users can change their passwords, ensuring a secure voting environment.

## Features

- User sign up or login or logout or refresh-token
- See the list of candidates
- Vote for a candidate (each user can vote only once)
- Live vote counts for candidates, sorted by vote count
- User data must include a unique government ID proof (Aadhar card number)
- Admin can maintain the list of candidates but cannot vote
- Users can change their passwords
- Users will be forget password and set new password
- User login using Aadhar card number and password

## API Endpoints

##### User Authentication

| Method | Endpoint            | Description                          |
| ------ | ------------------- | ------------------------------------ |
| POST   | `/signup`         | Create a new user account            |
| POST   | `/login`          | Log in to an existing account        |
| GET    | `/logout`         | Logout to an existing account        |
| POST   | `/refresh-token ` | refresh & Access token will refresh |

##### Voting

| Method | Endpoint               | Description                     |
| ------ | ---------------------- | ------------------------------- |
| GET    | `/candidates/list`   | Retrieve the list of candidates |
| POST   | `/vote/:candidateId` | Vote for a specific candidate   |

##### Vote Counts

| Method | Endpoint         | Description                                      |
| ------ | ---------------- | ------------------------------------------------ |
| GET    | `/votes/count` | Get the list of candidates sorted by vote counts |

##### User Profile

| Method | Endpoint                      | Description                             |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/profile`                  | Retrieve the user's profile information |
| PUT    | `/profile/password`         | Change the user's password              |
| PUT    | `/profile/forget-password ` | User will forget their password         |

##### Admin Candidate Management

| Method | Endpoint                     | Description                      |
| ------ | ---------------------------- | -------------------------------- |
| POST   | `/candidates`              | Create a new candidate           |
| PUT    | `/candidates/:candidateId` | Update an existing candidate     |
| DELETE | `/candidates/:candidateId` | Delete a candidate from the list |

## Installation

Install my-project with npm

```
  npm install voting-api
  cd my-project
  
```

## Run Locally

Clone the project

```
  git clone https://github.com/karanGautam-dev/Voting-api.git
```

Go to the project directory

```
  cd  voting-api
```

Install dependencies

```
  npm install
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

```
PORT=3000
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.lxl3fsq.mongodb.net
mongoDB_local_URL=mongodb://localhost:27017/

CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=votingApp
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=KaranGuatam
REFRESH_TOKEN_EXPIRY=10d

Email_ID=karangautam2023@gmail.com
Email_Password=gautam
```

## Start the Server

To start server, run the following command

```
  npm run start

  # Devepment run command
  npm run dev
```

### Localhost Link

When you run your Voting API locally, you can access it using the following URL:

- [http://localhost:3000](http://localhost:3000)

Replace `3000` with the port number specified in your application if it’s different.

## 🛠 Skills

Javascript, Node.js, Express.js, MongoDB...

## Authors

- [@KaranKumarGuatam](https://github.com/karanGautam-dev)

## License

[MIT](https://choosealicense.com/licenses/mit/)
