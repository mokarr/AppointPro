// This is a simplified version, in a real app you would import from a toast library
// like react-hot-toast, sonner, or use the shadcn/ui toast implementation

import { useCallback } from "react"

type ToastVariant = "default" | "destructive" | "success"

type ToastProps = {
    title: string
    description?: string
    variant?: ToastVariant
    duration?: number
}

export const toast = (props: ToastProps) => {
    // In a real implementation, this would call the actual toast function
    console.log("Toast:", props)
}

export const useToast = () => {
    const showToast = useCallback((props: ToastProps) => {
        toast(props)
    }, [])

    return { toast: showToast }
} 