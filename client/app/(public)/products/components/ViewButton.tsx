'use client';

import { useRouter } from 'next/navigation';

interface Props {
  id: string;
}

export default function ViewButton({ id }: Props) {
  const router = useRouter();

  return (
    <button
      className="py-2 px-4 bg-blue-600 text-white rounded"
      onClick={() => router.push(`/products/${id}`)}
    >
      View
    </button>
  );
}