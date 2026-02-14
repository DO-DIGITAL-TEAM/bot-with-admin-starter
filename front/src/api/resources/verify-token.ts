import { client } from '../axios';

export async function verifyToken() {
  const response = await client.get('auth/verify-token');
  return response.data;
}
