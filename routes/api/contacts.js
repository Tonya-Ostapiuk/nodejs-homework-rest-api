const express = require("express");
const { ContactModel } = require("../../database/contact.model")
const {createHttpException} = require("../../servceis/index");
const router = express.Router();
const { addContactSchema, favoriteJoiSchema } = require("../../schemas/validation.schema");
const {userAuthMiddeleware} = require("../../middlewares");


router.get("/", userAuthMiddeleware, async (req, res, next) => {
  try {
    const contacts = await ContactModel.find({});
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", userAuthMiddeleware, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await ContactModel.findById(contactId);
    if (contact === null) {
      throw createHttpException("Not found", 404);
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", userAuthMiddeleware, async (req, res, next) => {
  try {
    const user = req.user;
    console.log(req.user)
    const {name, email, phone, favorite } = req.body;

    const { error } = addContactSchema.validate({ name, email, phone, favorite });

    if (error) {
      console.log(error)
      throw createHttpException("Missing required name field", 400);
    }

    const newContact = await ContactModel.create({name, email, phone, favorite, owner: user});
    res.status(201).send(newContact)
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", userAuthMiddeleware, async (req, res, next) => {
  try {
    const user = req.user;
    console.log(req.user)
    const { contactId } = req.params;
    const removeContact = await ContactModel.findByIdAndDelete(contactId, { owner: user });
    if (removeContact === null) {
      throw createHttpException("This contact is not found", 404);
    }
    res.json(removeContact);
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", userAuthMiddeleware, async (req, res, next) => {
  try {
    const user = req.user;
    const { contactId } = req.params;
    const { name, email, phone, favorite } = req.body;
    const { error } = addContactSchema.validate({ name, email, phone,favorite});

    if (error) {
      throw createHttpException("Missing field", 400);
    }

    const updateContact = await ContactModel.findByIdAndUpdate(contactId, { name, email, phone, favorite, owner: user }, {new: true})
    .catch((e) => {
      throw createHttpException("missing field favorite", 400);
    });

    if (updateContact === null) {
      throw createHttpException("This contact is not found", 404);
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
      throw createHttpException("Missing field", 400);
    }

    const updateFavContact = await ContactModel.findByIdAndUpdate(contactId, { favorite }, {new: true})
    .catch((e) => {
      throw createHttpException("missing field favorite", 400);
    });

    if (updateFavContact === null) {
      throw createHttpException("This contact is not found", 404);
    }
    res.json(updateFavContact);

  } catch (error) {
    next(error);
  }
});


module.exports = router;
