import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  name: string;
  emailContact: string;
  phoneContact: string;
  companyName?: string;
  dob?: string;
  address?: string;
  note?: string;
}

interface User {
  _id: string;
  alias: string;
  email: string;
  role: string;
  isActive: boolean;
  profile?: UserProfile;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ 
      user: User; 
      accessToken: string;
      refreshToken: string;
    }>) {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = {
        ...state.user,
        ...action.payload,
      };
      state.error = null;
    },
    updateProfile(state, action: PayloadAction<UserProfile>) {
      if (state.user) {
        state.user.profile = {
          ...state.user.profile,
          ...action.payload,
        };
      }
    },
    updateToken(state, action: PayloadAction<{ 
      accessToken: string;
      refreshToken?: string;
    }>) {
      state.token = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
  },
});

export const { 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateUser, 
  updateProfile,
  updateToken 
} = authSlice.actions;

export default authSlice.reducer;