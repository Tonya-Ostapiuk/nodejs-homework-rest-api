const express = require("express");
const { ContactModel } = require("../../database/contact.model")
// const contactsRep = require("../../models/contacts");
const router = express.Router();
const { addContactSchema, favoriteJoiSchema } = require("../../schemas/validation.schema");

router.get("/", async (req, res, next) => {
  try {
    const contacts = await ContactModel.find({});
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await ContactModel.findById(contactId);
    if (contact === null) {
      const error = new Error("Not found");
      error.code = 404;
      throw error;
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {name, email, phone, favorite } = req.body;

    const { error } = addContactSchema.validate({ name, email, phone, favorite });

    if (error) {
      const err = new Error("Missing required name field");
      err.code = 400;
      throw err;
    }

    const newContact = await ContactModel.create({name, email, phone, favorite });
    res.status(201).send(newContact)
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const removeContact = await ContactModel.findByIdAndDelete(contactId);
    if (removeContact === null) {
      const err = new Error("This contact is not found");
      err.code = 404;
      throw err;
    }
    res.json(removeContact);
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { name, email, phone, favorite } = req.body;
    const { error } = addContactSchema.validate({ name, email, phone,favorite});

    if (error) {
      const err = new Error("Missing field");
      err.code = 400;
      throw err;
    }

    const updateContact = await ContactModel.findByIdAndUpdate(contactId, { name, email, phone, favorite }, {new: true})
    .catch((e) => {
      const err = Error("missing field favorite");
      err.code = 400;
      throw err;
    });

    if (updateContact === null) {
      const err = new Error("This contact is not found");
      err.code = 404;
      throw err;
    }
    res.json(updateContact);

  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { favorite } = req.body;
    const { error } = favoriteJoiSchema.validate({ favorite});

    if (error) {
      const err = new Error("Missing field");
      err.code = 400;
      throw err;
    }

    const updateFavContact = await ContactModel.findByIdAndUpdate(contactId, { favorite }, {new: true})
    .catch((e) => {
      const err = Error("missing field favorite");
      err.code = 400;
      throw err;
    });

    if (updateFavContact === null) {
      const err = new Error("This contact is not found");
      err.code = 404;
      throw err;
    }
    res.json(updateFavContact);

  } catch (error) {
    next(error);
  }
});


module.exports = router;
