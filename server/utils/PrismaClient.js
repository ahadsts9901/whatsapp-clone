const { PrismaClient } = require("@prisma/client");

let prismaInstance = null;

const getPrismaInstance = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
};
module.exports = getPrismaInstance;
