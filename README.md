# Finance Management App

> Application that store information about your expenses

## Sections
- Authentication and authorization (register, login)
- Transactions (add, remove, get one, get list by time range, change category)
- Categories (create, delete)
- Monthly Limits (create, delete, update amount)

### Features
1. User can get transaction list by time range (day, week, month)
2. If the user exceeds the monthly limit, he will receive an information letter to his email.

## Tech
- NestJs
- Typescript
- Prisma ORM
- JWT

## Quickstart
Clone this repository
```sh
git clone https://github.com/Jiraf400/nest-fin-management
```

> [WARNING]  
> You need to provide your own database connection path and jwt secret key in .env file

Install dependencies and start the server.
```sh
npm i
npm run start
```

