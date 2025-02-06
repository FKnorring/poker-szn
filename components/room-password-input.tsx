'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

interface RoomPasswordInputProps {
  roomId: string;
}

export default function RoomPasswordInput({ roomId }: RoomPasswordInputProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/rooms/${roomId}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Incorrect password');
      }

      // Refresh the page to show unobfuscated data
      router.push(`/pokerroom/${roomId}`);
    } catch (err) {
      setError('Incorrect password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Enter room password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={error ? 'border-red-500' : ''}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Checking...' : 'Submit'}
      </Button>
    </form>
  );
} 