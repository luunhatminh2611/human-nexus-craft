import { ReactNode, forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode; // Button text or content
  size?: "sm" | "md" | "icon" | null; // Button size
  variant?: "primary" | "outline" | "ghost" | "destructive"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  className?: string; // Additional classes
  justify?: "start" | "center" | "end" | "between"; // Button justify
  padding?: "px-3" | "px-2 py-2"; // Button padding
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      size = "sm",
      variant = "primary",
      startIcon,
      endIcon,
      className = "",
      disabled = false,
      type = "button",
      justify = "center",
      ...rest
    },
    ref
  ) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-4 py-3 text-sm font-medium",
    md: "px-5 py-3.5 text-base font-medium",
    icon: "h-5 w-5 p-0"
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-[#32385f] text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
    ghost:
      "bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-400 dark:hover:bg-white/5",
    destructive:
      "bg-red-500 text-white shadow-theme-xs hover:bg-red-600 disabled:bg-red-300"
  };

  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-${justify} gap-2 rounded-lg transition ${className} ${
        size ? sizeClasses[size] : ""
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      disabled={disabled}
      type={type}
      {...rest}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
}
);

export default Button;
