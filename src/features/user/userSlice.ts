import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

export interface User {
  email: string;
  id: number;
  jti: string;
  token: string;
  admin_role: "management" | "warehouse";
}

interface UserState {
  user: User | null;
}

const getUserFromLocalStorage = (): User | null => {
  try {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  } catch {
    return null;
  }
};

const initialState: UserState = {
  user: getUserFromLocalStorage(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      console.log('userSlice action.payload:', action.payload);
      const { user, token } = action.payload;
      console.log(`userSlice user`, user);

      const userWithToken = {
        ...user,
        token: token,
      };

      // Update Redux state
      state.user = userWithToken;
      console.log('userSlice user with token:', userWithToken);

      // Store everything in one place
      localStorage.setItem('user', JSON.stringify(userWithToken));
    },
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    },
  },
});

export const { loginUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
