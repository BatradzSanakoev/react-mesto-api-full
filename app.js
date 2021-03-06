/* eslint-disable max-len */
const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { celebrate, Joi, CelebrateError } = require('celebrate');
// const validator = require('validator');
const cors = require('cors');
require('dotenv').config();

const usersRouter = require('./routes/users.js');
const cardsRouter = require('./routes/cards.js');
const { login, createUser } = require('./controllers/user.js');
const auth = require('./middlewares/auth.js');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/NotFoundError');

const { PORT = 3000 } = process.env;
const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// const whitelist = [
//   'https://sb13.students.nomoreparties.xyz',
//   'https://www.sb13.students.nomoreparties.xyz',
//   'https://api.sb13.students.nomoreparties.xyz',
//   'https://www.api.sb13.students.nomoreparties.xyz'
// ];
// const corsOptions = {
//   origin: (origin, callback) => {
//     console.log(origin, whitelist, whitelist.indexOf(origin));
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// };

app.use(cors());

// app.use(cookieParser());
app.use(limiter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8)
  })
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    // name: Joi.string().required().min(2).max(30),
    // about: Joi.string().required().min(2).max(30),
    // avatar: Joi.string().required().custom((url) => {
    //   if (!validator.isURL(url)) {
    //     throw new CelebrateError('Неверно введенный URL');
    //   }
    //   return url;
    // }),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).custom((pass) => {
      const regex = /^\S*$/;
      if (!regex.test(pass)) {
        throw new CelebrateError('Неверно введенный пароль');
      }
      return pass;
    })
  })
}), createUser);

app.use(auth);

app.use('/', usersRouter);
app.use('/', cardsRouter);
// eslint-disable-next-line no-unused-vars
app.all('/*', (req, res, next) => {
  throw new NotFoundError({ message: 'Запрашиваемый ресурс не найден' });
});

app.use(errorLogger);
app.use(errors());

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
});

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});