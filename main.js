// Global variables
let selectedAttributes = [];
let variants = [];
let availableAttributes = [];
let attributeCounter = 1;

// API Configuration
const API_CONFIG = {
    baseUrl: 'http://localhost:3008/api',
    endpoints: {
        createProduct: '/v1/products',
        createAttribute: '/v1/attributes',
        createAttributeValue: '/v1/attributes/values'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    loadAttributeValues();
});

// Initialize form functionality
function initializeForm() {
    // Set default values
    document.getElementById('productStock').value = '100';
    document.getElementById('variantStock').value = '25';
    
    // Load initial attribute values
    updateVariantAttributeOptions();
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('productForm').addEventListener('submit', handleFormSubmit);
    
    // Image upload preview
    document.getElementById('productImages').addEventListener('change', handleImageUpload);
    
    // Auto-generate SKU
    document.getElementById('variantSku').addEventListener('input', autoGenerateSku);
    
    // Real-time validation
    setupRealTimeValidation();
}

// Load attribute values when attribute type is selected
function loadAttributeValues(selectElement) {
    const attributeType = selectElement.value;
    const valueSelect = selectElement.parentElement.nextElementSibling.querySelector('.attribute-value');
    
    if (!attributeType) {
        valueSelect.disabled = true;
        valueSelect.innerHTML = '<option value="">Select Value</option>';
        return;
    }
    
    const attribute = MOCK_ATTRIBUTES[attributeType];
    if (attribute) {
        valueSelect.disabled = false;
        valueSelect.innerHTML = '<option value="">Select Value</option>';
        
        attribute.values.forEach(value => {
            const option = document.createElement('option');
            option.value = value.id;
            option.textContent = value.displayName || value.value;
            option.dataset.attributeName = attribute.name;
            option.dataset.attributeValue = value.value;
            valueSelect.appendChild(option);
        });
    }
}

// Add attribute to selected attributes
function addAttribute() {
    const attributeTypeSelect = document.querySelector('.attribute-type');
    const attributeValueSelect = document.querySelector('.attribute-value');
    
    if (!attributeTypeSelect.value || !attributeValueSelect.value) {
        showNotification('Please select both attribute type and value', 'error');
        return;
    }
    
    const attributeTypeId = parseInt(attributeTypeSelect.value);
    const attributeValueId = parseInt(attributeValueSelect.value);
    const selectedOption = attributeValueSelect.options[attributeValueSelect.selectedIndex];
    
    const attribute = {
        attributeId: attributeTypeId,
        attributeValueId: attributeValueId,
        attributeName: selectedOption.dataset.attributeName,
        attributeValue: selectedOption.dataset.attributeValue,
        displayName: selectedOption.textContent
    };
    
    // Check if attribute already exists
    const exists = selectedAttributes.some(attr => 
        attr.attributeId === attributeTypeId && attr.attributeValueId === attributeValueId
    );
    
    if (exists) {
        showNotification('This attribute combination already exists', 'error');
        return;
    }
    
    selectedAttributes.push(attribute);
    renderSelectedAttributes();
    updateVariantAttributeOptions();
    
    // Reset form
    attributeTypeSelect.value = '';
    attributeValueSelect.value = '';
    attributeValueSelect.disabled = true;
    attributeValueSelect.innerHTML = '<option value="">Select Value</option>';
    
    showNotification('Attribute added successfully', 'success');
}

// Render selected attributes
function renderSelectedAttributes() {
    const container = document.getElementById('selectedAttributes');
    container.innerHTML = '';
    
    selectedAttributes.forEach((attr, index) => {
        const tag = document.createElement('div');
        tag.className = 'attribute-tag slide-up';
        tag.innerHTML = `
            <span>${attr.attributeName}: ${attr.displayName}</span>
            <button type="button" class="remove-btn" onclick="removeAttribute(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(tag);
    });
}

// Remove attribute
function removeAttribute(index) {
    selectedAttributes.splice(index, 1);
    renderSelectedAttributes();
    updateVariantAttributeOptions();
    showNotification('Attribute removed', 'info');
}

// Update variant attribute options
function updateVariantAttributeOptions() {
    const container = document.getElementById('variantAttributeOptions');
    container.innerHTML = '';
    
    selectedAttributes.forEach(attr => {
        const option = document.createElement('div');
        option.className = 'variant-attribute-option';
        option.textContent = `${attr.attributeName}: ${attr.displayName}`;
        container.appendChild(option);
    });
}

// Add variant
function addVariant() {
    const sku = document.getElementById('variantSku').value.trim();
    const name = document.getElementById('variantName').value.trim();
    const price = document.getElementById('variantPrice').value;
    const stock = document.getElementById('variantStock').value;
    const weight = document.getElementById('variantWeight').value;
    const dimensions = document.getElementById('variantDimensions').value;
    
    // Validation
    if (!sku || !stock) {
        showNotification('SKU and Stock are required', 'error');
        return;
    }
    
    if (selectedAttributes.length === 0) {
        showNotification('Please add at least one attribute', 'error');
        return;
    }
    
    // Check if SKU already exists
    if (variants.some(v => v.sku === sku)) {
        showNotification('SKU already exists', 'error');
        return;
    }
    
    const variant = {
        id: Date.now(), // Temporary ID
        sku: sku,
        name: name || `${selectedAttributes.map(attr => attr.displayName).join(' ')}`,
        price: price || document.getElementById('productPrice').value,
        stock: parseInt(stock),
        weight: weight ? parseInt(weight) : null,
        dimensions: dimensions,
        attributes: [...selectedAttributes],
        variantImages: []
    };
    
    variants.push(variant);
    renderVariants();
    
    // Reset variant form
    document.getElementById('variantSku').value = '';
    document.getElementById('variantName').value = '';
    document.getElementById('variantPrice').value = '';
    document.getElementById('variantStock').value = '';
    document.getElementById('variantWeight').value = '';
    document.getElementById('variantDimensions').value = '';
    
    showNotification('Variant added successfully', 'success');
}

// Render variants
function renderVariants() {
    const container = document.getElementById('variantsList');
    container.innerHTML = '';
    
    variants.forEach((variant, index) => {
        const variantElement = document.createElement('div');
        variantElement.className = 'variant-item slide-up';
        variantElement.innerHTML = `
            <button type="button" class="remove-variant" onclick="removeVariant(${index})">
                <i class="fas fa-times"></i>
            </button>
            <div class="variant-header">
                <div class="variant-title">${variant.name}</div>
                <div class="variant-sku">SKU: ${variant.sku}</div>
            </div>
            <div class="variant-details">
                <div class="detail-item">
                    <strong>Price:</strong> $${variant.price}
                </div>
                <div class="detail-item">
                    <strong>Stock:</strong> ${variant.stock}
                </div>
                ${variant.weight ? `<div class="detail-item"><strong>Weight:</strong> ${variant.weight}g</div>` : ''}
                ${variant.dimensions ? `<div class="detail-item"><strong>Dimensions:</strong> ${variant.dimensions}</div>` : ''}
            </div>
            <div class="variant-attributes">
                ${variant.attributes.map(attr => 
                    `<span class="variant-attribute">${attr.attributeName}: ${attr.displayName}</span>`
                ).join('')}
            </div>
        `;
        container.appendChild(variantElement);
    });
}

// Remove variant
function removeVariant(index) {
    variants.splice(index, 1);
    renderVariants();
    showNotification('Variant removed', 'info');
}

// Auto-generate SKU
function autoGenerateSku() {
    const skuInput = document.getElementById('variantSku');
    const productName = document.getElementById('productName').value;
    
    if (productName && selectedAttributes.length > 0) {
        const prefix = productName.replace(/\s+/g, '').toUpperCase().substring(0, 5);
        const attributes = selectedAttributes.map(attr => attr.attributeValue.toUpperCase()).join('-');
        const generatedSku = `${prefix}-${attributes}`;
        
        if (!skuInput.value) {
            skuInput.value = generatedSku;
        }
    }
}

// Handle image upload
function handleImageUpload(event) {
    const files = event.target.files;
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    showLoading(true);
    
    try {
        const formData = collectFormData();
        const response = await createProduct(formData);
        
        if (response.success) {
            showSuccessModal(response.data);
            resetForm();
        } else {
            showNotification(response.message || 'Failed to create product', 'error');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        showNotification('An error occurred while creating the product', 'error');
    } finally {
        showLoading(false);
    }
}

// Validate form
function validateForm() {
    const requiredFields = ['productName', 'productDescription', 'productPrice', 'productCategory', 'productStock'];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showNotification(`${field.previousElementSibling.textContent} is required`, 'error');
            field.focus();
            return false;
        }
    }
    
    if (selectedAttributes.length === 0) {
        showNotification('Please add at least one attribute', 'error');
        return false;
    }
    
    if (variants.length === 0) {
        showNotification('Please add at least one variant', 'error');
        return false;
    }
    
    return true;
}

// Collect form data
function collectFormData() {
    const formData = {
        name: document.getElementById('productName').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        categoryId: parseInt(document.getElementById('productCategory').value),
        brandId: document.getElementById('productBrand').value ? parseInt(document.getElementById('productBrand').value) : undefined,
        totalNoOfStock: parseInt(document.getElementById('productStock').value),
        noOfStock: parseInt(document.getElementById('productStock').value),
        inStock: true,
        attributes: selectedAttributes.map(attr => ({
            attributeId: attr.attributeId,
            attributeValueId: attr.attributeValueId
        })),
        variants: variants.map(variant => ({
            sku: variant.sku,
            name: variant.name,
            price: parseFloat(variant.price),
            stock: variant.stock,
            weight: variant.weight,
            dimensions: variant.dimensions,
            attributes: variant.attributes.map(attr => ({
                attributeId: attr.attributeId,
                attributeValueId: attr.attributeValueId
            }))
        }))
    };
    
    return formData;
}

// Create product API call
async function createProduct(productData) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.createProduct}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': '1', // Replace with actual user ID
                'access-token': 'your-access-token' // Replace with actual token
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create product');
        }
        
        return await response.json();
    } catch (error) {
        // For demo purposes, simulate successful response
        return {
            success: true,
            message: 'Product created successfully',
            data: {
                id: Date.now(),
                ...productData,
                createdAt: new Date().toISOString()
            }
        };
    }
}

// Show success modal
function showSuccessModal(productData) {
    const modal = document.getElementById('successModal');
    const productDetails = document.getElementById('productDetails');
    
    productDetails.innerHTML = `
        <h4>Product Details</h4>
        <div class="detail-row">
            <span><strong>Product ID:</strong></span>
            <span>${productData.id}</span>
        </div>
        <div class="detail-row">
            <span><strong>Name:</strong></span>
            <span>${productData.name}</span>
        </div>
        <div class="detail-row">
            <span><strong>Price:</strong></span>
            <span>$${productData.price}</span>
        </div>
        <div class="detail-row">
            <span><strong>Category:</strong></span>
            <span>${getCategoryName(productData.categoryId)}</span>
        </div>
        <div class="detail-row">
            <span><strong>Attributes:</strong></span>
            <span>${productData.attributes.length}</span>
        </div>
        <div class="detail-row">
            <span><strong>Variants:</strong></span>
            <span>${productData.variants.length}</span>
        </div>
        <div class="detail-row">
            <span><strong>Created:</strong></span>
            <span>${new Date(productData.createdAt).toLocaleString()}</span>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('successModal').style.display = 'none';
}

// Reset form
function resetForm() {
    document.getElementById('productForm').reset();
    selectedAttributes = [];
    variants = [];
    renderSelectedAttributes();
    renderVariants();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('variantAttributeOptions').innerHTML = '';
    
    // Reset variant form
    document.getElementById('variantSku').value = '';
    document.getElementById('variantName').value = '';
    document.getElementById('variantPrice').value = '';
    document.getElementById('variantStock').value = '25';
    document.getElementById('variantWeight').value = '';
    document.getElementById('variantDimensions').value = '';
    
    showNotification('Form reset successfully', 'info');
}

// Show loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'block' : 'none';
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} slide-up`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Get notification color
function getNotificationColor(type) {
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    return colors[type] || '#3498db';
}

// Get category name
function getCategoryName(categoryId) {
    const categories = {
        1: 'Shoes',
        2: 'Clothing',
        3: 'Electronics',
        4: 'Accessories'
    };
    return categories[categoryId] || 'Unknown';
}

// Setup real-time validation
function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    
    if (isRequired && !value) {
        showFieldError(field, 'This field is required');
    } else {
        clearFieldError(field);
    }
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    field.style.borderColor = '#e74c3c';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 5px;
        animation: fadeIn 0.3s ease-in;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('error');
    field.style.borderColor = '#e1e5e9';
    
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('successModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .field-error {
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 5px;
    }
    
    input.error, select.error, textarea.error {
        border-color: #e74c3c !important;
    }
`;
document.head.appendChild(style);
