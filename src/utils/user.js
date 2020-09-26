/*
 *  Storage for user data
 */

const user = {
  getName() {
    return localStorage.getItem('userName');
  },
  setName(name) {
    localStorage.setItem('userName', name);
  },
};

export default user;