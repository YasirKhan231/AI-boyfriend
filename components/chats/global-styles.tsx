import type React from "react";
const GlobalStyles: React.FC = () => {
  return (
    <style jsx global>{`
      :root {
        --background: 0 0% 0%;
        --foreground: 0 0% 98%;
        --card: 0 0% 11%;
        --card-foreground: 0 0% 98%;
        --popover: 0 0% 11%;
        --popover-foreground: 0 0% 98%;
        --primary: 0 0% 20%;
        --primary-foreground: 0 0% 98%;
        --secondary: 0 0% 15%;
        --secondary-foreground: 0 0% 98%;
        --muted: 0 0% 15%;
        --muted-foreground: 0 0% 65%;
        --accent: 0 0% 25%;
        --accent-foreground: 0 0% 98%;
        --destructive: 0 0% 40%;
        --destructive-foreground: 0 0% 98%;
        --border: 0 0% 20%;
        --input: 0 0% 20%;
        --ring: 0 0% 30%;
        --radius: 0.5rem;
        --gray-50: #f9fafb;
        --gray-100: #f3f4f6;
        --gray-200: #e5e7eb;
        --gray-300: #d1d5db;
        --gray-400: #9ca3af;
        --gray-500: #6b7280;
        --gray-600: #4b5563;
        --gray-700: #374151;
        --gray-800: #1f2937;
        --gray-900: #111827;
        --gray-950: #030712;
        --blue-500: #3b82f6;
        --blue-600: #2563eb;
        --blue-700: #1d4ed8;
        --red-500: #ef4444;
        --red-600: #dc2626;
        --red-700: #b91c1c;
      }

      * {
        border-color: hsl(var(--border));
      }

      body {
        background-color: #000;
        color: hsl(var(--foreground));
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes scaleIn {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes bounce {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      .animate-accordion-down {
        animation: accordion-down 0.2s ease-out;
      }

      .animate-accordion-up {
        animation: accordion-up 0.2s ease-out;
      }

      .animate-bounce {
        animation: bounce 1s infinite;
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }

      .animate-pulse {
        animation: pulse 1.5s ease infinite;
      }

      .fade-in {
        animation: fadeIn 0.2s ease-out;
      }

      .scale-in {
        animation: scaleIn 0.3s ease-out;
      }

      .container {
        width: 100%;
        margin-right: auto;
        margin-left: auto;
        padding-right: 1rem;
        padding-left: 1rem;
      }

      @media (min-width: 640px) {
        .container {
          padding-right: 1.5rem;
          padding-left: 1.5rem;
        }
      }

      @media (min-width: 1400px) {
        .container {
          max-width: 1400px;
        }
      }

      .rounded-custom {
        border-radius: var(--radius);
      }

      .rounded-custom-md {
        border-radius: calc(var(--radius) - 2px);
      }

      .rounded-custom-sm {
        border-radius: calc(var(--radius) - 4px);
      }

      ::-webkit-scrollbar {
        width: 4px;
      }

      ::-webkit-scrollbar-track {
        background: transparent;
      }

      ::-webkit-scrollbar-thumb {
        background: #333;
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: #444;
      }

      *:focus-visible {
        outline: 2px solid hsl(var(--ring));
        outline-offset: 2px;
      }

      input::placeholder {
        color: #666;
      }

      .transition-all {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
      }

      .transition-colors {
        transition-property: color, background-color, border-color;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
      }

      .shadow-custom {
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1),
          0 1px 2px -1px rgb(0 0 0 / 0.1);
      }

      .shadow-subtle {
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        .rounded-2xl {
          border-radius: 1rem;
        }

        .p-4 {
          padding: 0.75rem;
        }

        .gap-3 {
          gap: 0.5rem;
        }
      }
    `}</style>
  );
};

export default GlobalStyles;
