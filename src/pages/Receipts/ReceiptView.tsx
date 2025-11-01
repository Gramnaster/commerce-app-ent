import React from 'react'
import { useLocation } from 'react-router-dom';

const ReceiptView = () => {
  let currentPath = useLocation();
  console.log(`currentPath`, currentPath.pathname)
  return (
    <div>
      ReceiptView
    </div>
  )
}

export default ReceiptView