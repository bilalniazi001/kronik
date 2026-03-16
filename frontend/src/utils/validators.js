export const validators = {
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  password: (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  },

  phone: (phone) => {
    const regex = /^03[0-9]{9}$/;
    return regex.test(phone);
  },

  cnic: (cnic) => {
    const regex = /^[0-9]{13}$/;
    return regex.test(cnic);
  },

  name: (name) => {
    return name && name.length >= 3 && /^[a-zA-Z\s]+$/.test(name);
  },

  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};