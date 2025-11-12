const jwt = require("jsonwebtoken");

class TokenService {
  generateToken(user) {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }
}

module.exports = new TokenService();
