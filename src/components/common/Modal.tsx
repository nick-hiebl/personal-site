import { useEffect, useRef } from 'react'

import './Modal.css'

type ModalProps = {
    children: React.ReactNode
    isOpen: boolean
    onClose: () => void
    title?: React.ReactNode
    actions?: React.ReactNode[]
}

export const Modal = ({ actions, children, isOpen, onClose, title }: ModalProps) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null)

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal()
        } else {
            dialogRef.current?.close()
        }
    }, [isOpen])

    return (
        <dialog className="Modal column gap-8px" ref={dialogRef} onClose={onClose}>
            <div className="Modal-title-row">
                {title && (
                    <h1 className="Modal-title">{title}</h1>
                )}
                <button onClick={onClose}>X</button>
            </div>
            {children}
            {actions && (
                <div className="row-center gap-4px" role="group">
                    {actions}
                </div>
            )}
        </dialog>
    )
}
