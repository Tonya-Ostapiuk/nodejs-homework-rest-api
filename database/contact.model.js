const mongoose = require('mongoose');

const contactShema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Set name for contact'],
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
      favorite: {
        type: Boolean,
        default: false,
      },
      //  versionKey: false, 
      //  timestamps: true,
})

const ContactModel = mongoose.model('contact', contactShema)


module.exports = {
    ContactModel,
} 