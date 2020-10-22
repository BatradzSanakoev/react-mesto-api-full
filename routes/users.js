/* eslint-disable object-curly-newline */
const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { getUsers, getUser, updateProfile, updateAvatar } = require('../controllers/user');

usersRouter.get('/users', getUsers);

usersRouter.get('/users/:_id', celebrate({
  params: Joi.object.keys({
    _id: Joi.string.alphanum().length(24)
  })
}), getUser);

usersRouter.patch('/users/me', celebrate({
  body: Joi.object.keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30)
  })
}), updateProfile);

usersRouter.patch('/users/me/avatar', celebrate({
  body: Joi.object.keys({
    avatar: Joi.string().required()
  })
}), updateAvatar);

module.exports = usersRouter;