
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useEffect } from "react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  // Auto-dismiss non-error toasts after 3 seconds, network errors after 6 seconds
  useEffect(() => {
    toasts.forEach((toast) => {
      // Skip auto-dismiss for destructive variant (error) toasts
      if (toast.variant === "destructive") {
        // For network errors, we still want to auto-dismiss after 6 seconds
        const isNetworkError = toast.description && 
          (typeof toast.description === 'string') && 
          toast.description.toLowerCase().includes('connect');
        
        if (isNetworkError) {
          const timer = setTimeout(() => {
            dismiss(toast.id)
          }, 6000);
          return () => clearTimeout(timer);
        }
        
        return;
      }
      
      const timer = setTimeout(() => {
        dismiss(toast.id)
      }, 3000);

      return () => clearTimeout(timer);
    });
  }, [toasts, dismiss]);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
