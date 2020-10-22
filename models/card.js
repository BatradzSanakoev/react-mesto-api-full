/* eslint-disable no-useless-escape */
const mongoose = require('mongoose');

const regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?\#?$/;

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
        return regex.test(v);
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