"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    onCancel: () => void
    title: string
    description: string
    warningMessage?: string
    cancelText: string
    confirmText: string
    itemDetails?: React.ReactNode
    showWarningOnConfirm?: boolean
}

export function DeleteConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    onCancel,
    title,
    description,
    warningMessage,
    cancelText,
    confirmText,
    itemDetails,
    showWarningOnConfirm = false
}: DeleteConfirmationDialogProps) {
    const [showWarning, setShowWarning] = useState(false)

    const handleConfirmClick = () => {
        if (showWarningOnConfirm && !showWarning) {
            setShowWarning(true)
            return
        }

        onConfirm()
        if (showWarningOnConfirm) {
            setShowWarning(false)
        }
    }

    const handleCancelClick = () => {
        onCancel()
        if (showWarningOnConfirm) {
            setShowWarning(false)
        }
    }

    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen)
        if (!isOpen && showWarningOnConfirm) {
            setShowWarning(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {itemDetails}

                    {/* Warning message (either always shown or conditionally shown) */}
                    {(warningMessage && (!showWarningOnConfirm || showWarning)) && (
                        <div className="mt-4 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                            <p className="text-sm flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                <span>
                                    <strong className="font-medium">Warning:</strong> {warningMessage}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleCancelClick}>
                        {cancelText}
                    </Button>
                    <Button variant="destructive" onClick={handleConfirmClick}>
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 