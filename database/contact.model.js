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
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
      //  versionKey: false, 
      //  timestamps: true,
})

const ContactModel = mongoose.model('contact', contactShema)


module.exports = {
    ContactModel,
} 