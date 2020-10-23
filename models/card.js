/* eslint-disable no-useless-escape */
const mongoose = require('mongoose');
const validator = require('validator');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return validator.isURL(v);
      },
      message: (props) => `${props.value} is not a valid link!`
    }
  },
  owner: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  likes: [{
    type: mongoose.Types.ObjectId,
    default: []
  }],
  createAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('card', cardSchema);