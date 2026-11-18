export type ResetPasswordState = {
  status: 'idle' | 'error';
  message?: string;
  errors?: {
    password?: string;
    confirmPassword?: string;
  };
};

export const initialResetPasswordState: ResetPasswordState = {
  status: 'idle',
};
