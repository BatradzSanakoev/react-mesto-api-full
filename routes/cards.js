/* eslint-disable object()-curly-newline */
const cardsRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { createCard, getCards, deleteCard, likeCard, dislikeCard } = require('../controllers/card');

cardsRouter.get('/cards', getCards);

cardsRouter.post('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required()
  })
}), createCard);

cardsRouter.delete('/cards/:_id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().alphanum().length(24)
  })
}), deleteCard);

cardsRouter.put('/cards/:_id/likes', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().alphanum().length(24)
  })
}), likeCard);

cardsRouter.delete('/cards/:_id/likes', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().alphanum().length(24)
  })
}), dislikeCard);

module.exports = cardsRouter;