// app/(tabs)/add.tsx
import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function AddTab() {
  useEffect(() => {}, []);
  return <Redirect href="/modals/add-link" />;
}


