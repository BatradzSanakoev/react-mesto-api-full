const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { celebrate, Joi, CelebrateError } = require('celebrate');
const validator = require('validator');
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

const whitelist = ['https://bato7.students.nomoreparties.space/sign-in', 'https://www.bato7.students.nomoreparties.space/sign-in'];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(cookieParser());
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
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().custom((url) => {
      if (!validator.isURL(url)) {
        throw new CelebrateError('Неверно введенный URL');
      }
      return url;
    }),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8)
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

/*
{
  "email": "sanakoev.batraz@yandex.ru",
  "password": "1234",
  "name": "batradz",
  "about": "student",
  "avatar": "https://images.unsplash.com/photo-1601758066440-cbfc06a82914?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
}
*/