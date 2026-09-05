'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function PasswordInput(
  { className = '', ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={`input-field pr-10 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        title={visible ? 'Ocultar senha' : 'Mostrar senha'}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

export default PasswordInput;
