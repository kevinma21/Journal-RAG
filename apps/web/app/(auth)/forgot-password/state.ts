export type ForgotPasswordState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  errors?: {
    email?: string;
  };
};

export const initialForgotPasswordState: ForgotPasswordState = {
  status: 'idle',
};
