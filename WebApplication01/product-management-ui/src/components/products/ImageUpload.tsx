import React, { useState, useRef } from 'react';
import { Upload, X, Star, Link as LinkIcon, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { convertFileToBase64, isValidImageUrl } from '../../lib/utils';
import type { ProductImageRequest } from '../../types';

interface ImageUploadProps {
    images: ProductImageRequest[];
    onChange: (images: ProductImageRequest[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ images, onChange }) => {
    const [urlInput, setUrlInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsProcessing(true);
            try {
                const newImages: ProductImageRequest[] = [];
                for (let i = 0; i < e.target.files.length; i++) {
                    const file = e.target.files[i];
                    const base64 = await convertFileToBase64(file);
                    newImages.push({
                        imageUrl: base64,
                        displayOrder: images.length + i,
                        isPrimary: images.length === 0 && i === 0, // First image is primary by default
                        altText: file.name.split('.')[0],
                    });
                }
                onChange([...images, ...newImages]);
            } catch (error) {
                console.error('Error processing files:', error);
            } finally {
                setIsProcessing(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    const handleUrlAdd = () => {
        if (urlInput && isValidImageUrl(urlInput)) {
            onChange([
                ...images,
                {
                    imageUrl: urlInput,
                    displayOrder: images.length,
                    isPrimary: images.length === 0,
                    altText: 'Product Image',
                },
            ]);
            setUrlInput('');
        }
    };

    const handleRemove = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        // If we removed the primary image, make the first one primary (if exists)
        if (images[index].isPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true;
        }
        onChange(newImages);
    };

    const handleSetPrimary = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            isPrimary: i === index,
        }));
        onChange(newImages);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setIsProcessing(true);
            try {
                const newImages: ProductImageRequest[] = [];
                for (let i = 0; i < e.dataTransfer.files.length; i++) {
                    const file = e.dataTransfer.files[i];
                    if (file.type.startsWith('image/')) {
                        const base64 = await convertFileToBase64(file);
                        newImages.push({
                            imageUrl: base64,
                            displayOrder: images.length + i,
                            isPrimary: images.length === 0 && i === 0,
                            altText: file.name.split('.')[0],
                        });
                    }
                }
                onChange([...images, ...newImages]);
            } catch (error) {
                console.error('Error processing dropped files:', error);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                {/* Upload Area */}
                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging
                        ? 'border-blue-500 bg-blue-900/30 dark:bg-blue-900/20'
                        : 'border-gray-700/50 dark:border-gray-700 hover:border-gray-600/50 dark:hover:border-gray-600 bg-gray-900/30 dark:bg-gray-800/30'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-gray-800/50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            {isProcessing ? (
                                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                            ) : (
                                <Upload className="w-6 h-6 text-gray-400 dark:text-gray-400" />
                            )}
                        </div>
                        <div>
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 dark:hover:bg-blue-900/20 font-medium"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Click to upload
                            </Button>
                            <span className="text-gray-400 dark:text-gray-400"> or drag and drop</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            SVG, PNG, JPG or GIF (max. 800x400px)
                        </p>
                    </div>
                </div>

                {/* URL Input */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            placeholder="Or enter image URL..."
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            leftIcon={<LinkIcon className="w-4 h-4" />}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleUrlAdd}
                        disabled={!urlInput}
                    >
                        Add URL
                    </Button>
                </div>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="group relative aspect-square bg-gray-800/50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-700/50 dark:border-gray-700"
                        >
                            <img
                                src={image.imageUrl}
                                alt={image.altText || 'Product image'}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(index)}
                                        className="p-1.5 bg-gray-900/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-red-400 hover:bg-red-900/50 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => handleSetPrimary(index)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors backdrop-blur-sm ${image.isPrimary
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-900/90 dark:bg-gray-900/90 text-gray-300 dark:text-gray-300 hover:bg-gray-800/90'
                                            }`}
                                    >
                                        <Star className={`w-3 h-3 ${image.isPrimary ? 'fill-current' : ''}`} />
                                        {image.isPrimary ? 'Primary' : 'Set Primary'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
