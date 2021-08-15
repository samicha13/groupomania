const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const models = require("../models/user");

const email_reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const password_reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!.@#$%^&*])(?=.{8,})/;

// Création d'un compte 

exports.signup = (req, res, next) => {
  if ( // condition on vérifie l'existence de l'objet et s'il n'est pas vide
    !req.body.email  ||
    !req.body.nom ||
    !req.body.prenom ||
    !req.body.password ||
    req.body.email == "" ||
    req.body.nom == "" ||
    req.body.prenom == "" ||
    req.body.password == ""
  ) {
    return res
      .status(400)
      .json({ error: "Merci de remplir tous les champs !" });
  }
  if (!email_reg.test(req.body.email)) {
    return res.status(400).json({ error: "Email incorrect !" });
  }
  if (!password_reg.test(req.body.password)) {
    return res.status(401).json({
      error:
        "Minimum: 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère (!.@#$%^&*)",
    });
  }

  
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = {
        email: req.body.email,
        nom: req.body.nom,
        prenom: req.body.prenom,
        password: hash,
        isAdmin: false,
      };
      models.create(user)
        .then((user) => {
          res.status(201).json({
            userId: user.id,
            isAdmin: user.isAdmin,
            message: "Utilisateur créé !"
          });
        })
        .catch((error) => res.status(400).json({ error: error }));
    })
    .catch((error) => res.status(500).json({ error: error }));
};

exports.login = (req, res, next) => {
  if (req.body.email == null || req.body.password == null) {
    return res
      .status(400)
      .json({ error: "Merci de remplir tous les champs !" });
  }

  models.User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "Utilisateur introuvable !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user.id,
            name: user.name,
            firstname: user.firstname,
            token: jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, "TK_SESSION", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};