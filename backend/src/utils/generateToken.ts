const jwt = require('jsonwebtoken');

const GenerateToken = (id: string, role: string): string => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
        expiresIn: '30d'
    });
};

module.exports = { GenerateToken };
