import { db } from './db';

interface BaseUser {
  email?: string;
  password: string;
  name: string;
  role: 'doctor' | 'patient' | 'medical';
}

interface PatientUser extends BaseUser {
  role: 'patient';
  uhid: string;
}

interface OtherUser extends BaseUser {
  role: 'doctor' | 'medical';
  email: string;
}

type User = PatientUser | OtherUser;

export const registerUser = (user: OtherUser): boolean => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const exists = users.some((u: User) => 'email' in u && u.email === user.email);
  
  if (!exists) {
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }
  return false;
};

export const registerPatientUser = (user: PatientUser): boolean => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const exists = users.some((u: User) => 'uhid' in u && u.uhid === user.uhid);
  
  if (!exists) {
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }
  return false;
};

export const loginUser = (identifier: string, password: string): boolean => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find((u: User) => {
    if ('email' in u) {
      return u.email === identifier && u.password === password;
    } else {
      return u.uhid === identifier && u.password === password;
    }
  });

  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return true;
  }
  return false;
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
};

export const verifyEmail = async (email: string): Promise<boolean> => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find((u: User) => 'email' in u && u.email === email);
  return Boolean(user);
};

export const verifyUHID = async (uhid: string): Promise<boolean> => {
  try {
    const patient = await db.patients.where('uhid').equals(uhid).first();
    return Boolean(patient);
  } catch (err) {
    console.error('Error verifying UHID:', err);
    return false;
  }
};

export const resetPassword = async (identifier: string, newPassword: string): Promise<boolean> => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  let userFound = false;
  let userRole: string | undefined;

  const updatedUsers = users.map((user: User) => {
    if (
      ('email' in user && user.email === identifier) ||
      ('uhid' in user && user.uhid === identifier)
    ) {
      userFound = true;
      userRole = user.role;
      return { ...user, password: newPassword };
    }
    return user;
  });

  if (userFound) {
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    // Update current user if they're logged in
    const currentUser = getCurrentUser();
    if (currentUser && (
      ('email' in currentUser && currentUser.email === identifier) ||
      ('uhid' in currentUser && currentUser.uhid === identifier)
    )) {
      localStorage.setItem('currentUser', JSON.stringify({
        ...currentUser,
        password: newPassword
      }));
    }
    return true;
  }

  // For patients, check if UHID exists in database before allowing reset
  if (!userFound && await verifyUHID(identifier)) {
    const newUser: PatientUser = {
      uhid: identifier,
      password: newPassword,
      name: 'Patient', // This will be updated when they log in
      role: 'patient'
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }

  return false;
};