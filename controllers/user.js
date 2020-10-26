/* eslint-disable max-len */
/* eslint-disable object-curly-newline */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      if (!users) {
        throw new NotFoundError('Данные не найдены!');
      }
      res.send(users);
    })
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  console.log(req.params);
  console.log(req);
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      res.send(user);
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const { email, password } = req.body;
  bcrypt.hash(password.toString(), 10)
    .then((hash) => User.create({ name: 'Batradz', about: "Ya.Praktikum's student", avatar: 'https://images.unsplash.com/photo-1577170827381-e2c4e552bf9d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=60', email, password: hash }))
    .catch((err) => {
      console.log(err);
      if (err._message === 'user validation failed') {
        throw new ConflictError('Пользователь с таким электронным ящиком уже зарегистрирован или неправильно введен пароль!');
      } else next(err);
    })
    .then((newUser) => {
      if (!newUser) {
        throw new BadRequestError('Переданы некорректные данные!');
      }
      res.send({ name: newUser.name, about: newUser.about, avatar: newUser.avatar, email: newUser.email });
    })
    .catch(next);
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким Id!');
      }
      res.send(user);
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким Id!');
      }
      res.send(user);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Авторизация завершилась неудачно!');
      }
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      // res.cookie('jwt', token, {
      //   maxAge: 3600000 * 24 * 7,
      //   httpOnly: true,
      //   sameSite: 'Lax'
      // })
      //   .send({ message: 'Авторизация прошла успешно!' });
      res.send({ token });
    })
    .catch(next);
};