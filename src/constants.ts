export const CURRENCY=[
                      { value: 'USD', label: 'US Dollar ($)' },
                      { value: 'EUR', label: 'Euro (€)' },
                      { value: 'GBP', label: 'British Pound (£)' },
                      { value: 'JPY', label: 'Japanese Yen (¥)' },
                      { value: 'CAD', label: 'Canadian Dollar ($)' },
                      { value: 'AUD', label: 'Australian Dollar ($)' },
                      { value: 'CNY', label: 'Chinese Yuan (¥)' }
                    ]
export const PASSWORD_REQUIREMENTS =[
    {
      label: "At least one uppercase letter",
      validator: (p: string) => /[A-Z]/.test(p),
    },
    {
      label: "At least one lowercase letter",
      validator: (p: string) => /[a-z]/.test(p),
    },
    { label: "At least one number", validator: (p: string) => /[0-9]/.test(p) },
    {
      label: "At least one special character",
      validator: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
    },
    { label: "Minimum 8 characters", validator: (p: string) => p.length >= 8 },
  ];

export const VALIDATION_RULES = {
  names: {
    test: ({firstName, lastName}: {firstName: string, lastName: string}) => firstName.trim() && lastName.trim(),
    message: "Please enter both first and last names"
  },
  email: {
    test: ({email}: {email: string}) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    message: "Please enter a valid email address"
  },
  password: {
    test: ({password}: {password: string}) => PASSWORD_REQUIREMENTS.every(req => req.validator(password)),
    message: "Password does not meet all requirements"
  },
  confirmPassword: {
    test: ({password, confirmPassword}: {password: string, confirmPassword: string}) => password === confirmPassword,
    message: "Passwords do not match"
  }
};