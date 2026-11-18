export type LoginState = {
  status: 'idle' | 'error';
  message?: string;
  errors?: {
    email?: string;
    password?: string;
  };
};

export const initialLoginState: LoginState = {
  status: 'idle',
};
