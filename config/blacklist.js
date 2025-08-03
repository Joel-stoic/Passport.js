// config/blacklist.js

const blacklistedTokens = new Set();

export const addToBlacklist = async (token) => {
  blacklistedTokens.add(token);
};

export const isTokenBlacklisted = async (token) => {
  return blacklistedTokens.has(token);
};
