import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { productApi } from '../../services/product.service';
import type { Product } from '../../types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useToastStore } from '../../store/toast.store';

interface DeleteProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
    product,
    isOpen,
    onClose,
}) => {
    const queryClient = useQueryClient();
    const addToast = useToastStore((state) => state.addToast);

    const deleteMutation = useMutation({
        mutationFn: (id: string) => productApi.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            addToast({
                type: 'success',
                message: 'Product deleted successfully',
            });
            onClose();
        },
        onError: (error) => {
            addToast({
                type: 'error',
                message: error.message || 'Failed to delete product',
            });
        },
    });

    const handleDelete = () => {
        if (product) {
            deleteMutation.mutate(product.id);
        }
    };

    if (!product) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Product">
            <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400">
                    <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                    <p className="text-sm font-medium">
                        This action cannot be undone. This will permanently delete the product
                        <span className="font-bold"> "{product.name}" </span>
                        and all its variants.
                    </p>
                </div>

                {deleteMutation.isError && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                        {deleteMutation.error?.message || 'An error occurred while deleting the product.'}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={deleteMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        leftIcon={deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                    >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete Product'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteProductModal;
