
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-current border-t-transparent",
  {
    variants: {
      size: {
        default: "h-6 w-6 border-2",
        sm: "h-4 w-4 border-2",
        lg: "h-8 w-8 border-2",
        xl: "h-12 w-12 border-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof spinnerVariants> {}

export const Spinner = ({ className, size, ...props }: SpinnerProps) => {
  return (
    <div role="status" className={cn("flex items-center justify-center", className)}>
      <div className={spinnerVariants({ size })} {...props} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};
