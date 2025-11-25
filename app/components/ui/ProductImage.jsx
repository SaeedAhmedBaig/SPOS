'use client'

import Image from 'next/image'
import { Package, Smartphone, Laptop, Headphones, Watch } from 'lucide-react'

const getProductIcon = (productName) => {
  const name = productName.toLowerCase()
  
  if (name.includes('iphone') || name.includes('samsung') || name.includes('phone')) {
    return Smartphone
  } else if (name.includes('macbook') || name.includes('laptop') || name.includes('ipad')) {
    return Laptop
  } else if (name.includes('airpods') || name.includes('headphone') || name.includes('sony')) {
    return Headphones
  } else if (name.includes('watch')) {
    return Watch
  } else {
    return Package
  }
}

const getProductColor = (productName) => {
  const name = productName.toLowerCase()
  
  if (name.includes('iphone') || name.includes('apple')) {
    return 'from-gray-100 to-gray-200 text-gray-600'
  } else if (name.includes('samsung')) {
    return 'from-blue-50 to-blue-100 text-blue-600'
  } else if (name.includes('macbook')) {
    return 'from-slate-50 to-slate-100 text-slate-600'
  } else if (name.includes('sony')) {
    return 'from-black to-gray-800 text-white'
  } else {
    return 'from-gray-50 to-gray-100 text-gray-500'
  }
}

export default function ProductImage({ 
  src, 
  alt, 
  width = 80, 
  height = 80, 
  className = "",
  showIcon = true
}) {
  // If we have a real image URL, use Next.js Image component
  if (src && (src.startsWith('http') || src.startsWith('/'))) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={(e) => {
            // If image fails to load, show placeholder
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        {/* Fallback placeholder that shows if image fails */}
        <div 
          className={`hidden w-full h-full bg-gradient-to-br ${getProductColor(alt)} rounded-lg flex flex-col items-center justify-center ${className}`}
          style={{ width, height }}
        >
          {showIcon && (
            <>
              <Package className="w-6 h-6 mb-1 opacity-60" />
              <span className="text-xs text-center px-1 font-medium opacity-75">
                {alt.split(' ')[0]}
              </span>
            </>
          )}
        </div>
      </div>
    )
  }

  // Show styled placeholder with appropriate icon
  const ProductIcon = getProductIcon(alt)
  
  return (
    <div 
      className={`bg-gradient-to-br ${getProductColor(alt)} rounded-lg flex flex-col items-center justify-center ${className}`}
      style={{ width, height }}
    >
      {showIcon && (
        <>
          <ProductIcon className="w-6 h-6 mb-1 opacity-60" />
          <span className="text-xs text-center px-1 font-medium opacity-75">
            {alt.split(' ')[0]}
          </span>
        </>
      )}
    </div>
  )
}