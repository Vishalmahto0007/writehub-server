// utils/getRandomAvatar.js
const { boyAvatars, girlAvatars } = require("./avatarPool");

const getRandomAvatar = (gender) => {
  if (gender === "male") {
    return boyAvatars[Math.floor(Math.random() * boyAvatars.length)];
  } else if (gender === "female") {
    return girlAvatars[Math.floor(Math.random() * girlAvatars.length)];
  } else {
    const all = [...boyAvatars, ...girlAvatars];
    return all[Math.floor(Math.random() * all.length)];
  }
};

module.exports = getRandomAvatar;
