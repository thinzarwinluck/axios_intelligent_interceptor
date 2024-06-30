import { service } from './api-service';

const login = async () => {
  try {
    const response = await service.post('login');
    console.log('Login successful:', response);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

login();
