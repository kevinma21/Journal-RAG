export type SignUpState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  errors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

export const initialSignUpState: SignUpState = {
  status: 'idle',
};
