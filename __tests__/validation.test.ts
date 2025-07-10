import {
  validateEmail,
  validatePassword,
  validateName,
} from '../src/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should return null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user.name@domain.org')).toBeNull();
    });

    it('should return error for invalid email', () => {
      expect(validateEmail('')).toBe('Email is required');
      expect(validateEmail('invalid-email')).toBe(
        'Please enter a valid email address'
      );
      expect(validateEmail('test@')).toBe('Please enter a valid email address');
    });
  });

  describe('validatePassword', () => {
    it('should return null for valid password', () => {
      expect(validatePassword('Password123')).toBeNull();
      expect(validatePassword('Test123')).toBeNull();
    });

    it('should return error for invalid password', () => {
      expect(validatePassword('')).toBe('Password is required');
      expect(validatePassword('123')).toBe(
        'Password must be at least 6 characters'
      );
      expect(validatePassword('password')).toBe(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
      expect(validatePassword('PASSWORD123')).toBe(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
    });
  });

  describe('validateName', () => {
    it('should return null for valid name', () => {
      expect(validateName('John Doe')).toBeNull();
      expect(validateName('Test')).toBeNull();
    });

    it('should return error for invalid name', () => {
      expect(validateName('')).toBe('Name is required');
      expect(validateName('A')).toBe('Name must be at least 2 characters');
      expect(validateName('  ')).toBe('Name must be at least 2 characters');
    });
  });
});
