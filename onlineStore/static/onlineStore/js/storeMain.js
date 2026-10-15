document.addEventListener('DOMContentLoaded', function() {
    // CSRF token retrieval
    let csrftoken;
    const csrfElement = document.querySelector("[name=csrfmiddlewaretoken]");
    if (csrfElement) {
        csrftoken = csrfElement.value;
        console.log("CSRF Token:", csrftoken);
    }

    
    function backToTop() {
        const backToTopBtn = document.getElementById('back-to-top-btn');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }
    function burgerMenu() {
        const subHeaderLeft = document.getElementById('sub-header-left');

        const burgerMenuContent = document.getElementById('burger-menu-content');
        const burgerMenuOverlay = document.getElementById('burger-menu-overlay');
        const burgerMenuCloseBtn = document.getElementById('burger-menu-close-btn');

        if (subHeaderLeft && burgerMenuContent && burgerMenuOverlay && burgerMenuCloseBtn) {
            subHeaderLeft.addEventListener('click', function() {
                burgerMenuContent.classList.add('active');
                burgerMenuOverlay.classList.add('active');
            });

            burgerMenuCloseBtn.addEventListener('click', function() {
                burgerMenuContent.classList.remove('active');
                burgerMenuOverlay.classList.remove('active');
            });
            burgerMenuOverlay.addEventListener('click', function() {
                burgerMenuContent.classList.remove('active');
                burgerMenuOverlay.classList.remove('active');
            });
        }
    }
    function readMore() {
        const productDescription = document.getElementById('product-description');
        const readMoreBtn = document.getElementById('read-more-btn');
        const readLessBtn = document.getElementById('read-less-btn');
        const productName = document.getElementById('product-name');
        const productOverlay = document.getElementById('fade-overlay');
        if (!productDescription || !readMoreBtn || !readLessBtn || !productName || !productOverlay) {
            return;
        }
        if (productDescription.scrollHeight > productDescription.clientHeight) {
            readMoreBtn.style.display = 'inline-block';
        }
        else {
            readMoreBtn.style.display = 'none';
            productOverlay.style.display = 'none';
        }
        readMoreBtn.addEventListener('click', function() {
            productDescription.classList.toggle('expanded');
            readMoreBtn.style.display = 'none';
            readLessBtn.style.display = 'inline-block';
        });

        readLessBtn.addEventListener('click', function() { 
            productDescription.classList.toggle('expanded');
            readMoreBtn.style.display = 'inline-block';
            readLessBtn.style.display = 'none';
            
            window.scrollTo({
                top: productName.offsetTop - 20,
                behavior: 'smooth'
            });
        });
    }
    function starRating() {
        const starRatingContainers = document.querySelectorAll('.product-rating-container');
        starRatingContainers.forEach(container => {
            const stars = container.querySelectorAll('.rating-star');
            const rating = container.getAttribute('data-rating');
            stars.forEach(
                (star, index) => {
                    if (index < rating) {
                        star.classList.add('filled');
                    }
                })
        })
    }
    function productQuantitySelector() {
        const quantitySelectorContainer = document.querySelector('.quantity-selector'); 
        const decreaseBtn = document.getElementById('decrease-btn');
        const increaseBtn = document.getElementById('increase-btn');
        const quantityValue = document.getElementById('quantity-value');

        if (quantitySelectorContainer && decreaseBtn && increaseBtn && quantityValue) {
            const stock = parseInt(quantitySelectorContainer.getAttribute('data-stock'));
            let quantity = parseInt(quantityValue.textContent);

            function updateButtonStates() { 
                if (quantity <= 1) {
                    decreaseBtn.disabled = true;
                    decreaseBtn.classList.add('disabled');
                } else {
                    decreaseBtn.disabled = false;
                    decreaseBtn.classList.remove('disabled');
                }
                if (quantity >= stock) {
                    increaseBtn.disabled = true;
                    increaseBtn.classList.add('disabled');
                } else {
                    increaseBtn.disabled = false;
                    increaseBtn.classList.remove('disabled');
                }
            }

            updateButtonStates(); // Initial button state update
                
            increaseBtn.addEventListener('click', function() {
                if (quantity < stock) {
                    quantity++;
                    quantityValue.textContent = quantity;
                }
                updateButtonStates();
            });
            decreaseBtn.addEventListener('click', function() {
                if (quantity > 1) {
                    quantity--;
                    quantityValue.textContent = quantity;
                }
                updateButtonStates(); 
            }); 
        }
    }
    // CART LOGO UPDATE FUNCTION
    function updateCartLogo(count) {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = count;
        }
    }
    function Cart(csrftoken) {
        // CART PAGE FUNCTIONALITY
        const cartPageContainer = document.getElementById('cart-page-container');
        if (cartPageContainer) {
            
            const selectAllContainer = document.getElementById('select-all-container');
            const deselectAllContainer = document.getElementById('deselect-container');

            const removeFromCartBtns = cartPageContainer.querySelectorAll('.cart-remove-btn');
            const checkboxes = cartPageContainer.querySelectorAll('.cart-item-checkbox');
            const subTotalItems = cartPageContainer.querySelector('#cart-summary-subtotal-items')
            const totalPrice = cartPageContainer.querySelector('#cart-summary-total-price')
            const quantitySelectors = cartPageContainer.querySelectorAll('.quantity-selector');

            function updateQuantity() {

                quantitySelectors.forEach(selector => {
                    const stock = parseInt(selector.getAttribute('data-stock'));
                    const quantityValue = selector.querySelector('.quantity-value');
                    const increaseBtn = selector.querySelector('.increase-btn');
                    const decreaseBtn = selector.querySelector('.decrease-btn'); 
                    const productId = selector.getAttribute('data-product-id');
                    const cartItem = selector.closest('.cart-item');
                    const checkbox = cartItem.querySelector('.cart-item-checkbox');
                    let quantity = parseInt(quantityValue.textContent);

                    increaseBtn.addEventListener('click', async function() {
                    if (quantity < stock) {
                       
                        const data = await updateCartQuantity(productId, 'increase');
                        if (data.success) {
                            quantity++;
                            quantityValue.textContent = quantity;
                            checkbox.dataset.quantity = quantity; // Update the data-quantity attribute of the checkbox
                            cartItemCount = data.cart_items_count; // Update the cart item count from the server response
                            console.log('Updated cart item count:', cartItemCount);
                            updateCartLogo(cartItemCount);
                            updateCartSummary(); // Update the cart summary after changing the quantity
                        }
                        else {
                            console.log(data.message);
                        }
                        updateButtonStates(); 
                    }
                    });
                    decreaseBtn.addEventListener('click', async function() {
                    if (quantity > 1) {
                        const data = await updateCartQuantity(productId, 'decrease');
                        if (data.success) {
                            quantity--;
                            quantityValue.textContent = quantity;
                            checkbox.dataset.quantity = quantity; // Update the data-quantity attribute of the checkbox
                            cartItemCount = data.cart_items_count; // Update the cart item count from the server response
                            console.log('Updated cart item count:', cartItemCount);
                            updateCartLogo(cartItemCount);
                            updateCartSummary(); // Update the cart summary after changing the quantity
                        }
                        else {
                            console.log(data.message);
                        }
                        }
                        updateButtonStates(); 
                    });
                    function updateButtonStates() { 
                        if (quantity <= 1) {
                            decreaseBtn.disabled = true;
                            decreaseBtn.classList.add('disabled');
                        } else {
                            decreaseBtn.disabled = false;
                            decreaseBtn.classList.remove('disabled');
                        }
                        if (quantity >= stock) {
                            increaseBtn.disabled = true;
                            increaseBtn.classList.add('disabled');
                        } else {
                            increaseBtn.disabled = false;
                            increaseBtn.classList.remove('disabled');
                        }
                    }
                    updateButtonStates(); // Initial button state update
                })
                  
            }

            // SELECT / DESELECT ALL ITEMS FUNCTION
            function SelectUnselectItems() {
                if (deselectAllContainer) {
                    const button = deselectAllContainer.querySelector('button')
                    button.addEventListener('click', function() {
                        SelectItemsToggle('deselect');
                    })
                }
                if (selectAllContainer) {
                    const button = selectAllContainer.querySelector('button')
                    button.addEventListener('click', function() {
                        SelectItemsToggle('select');
                    })
                }
            }

            // CART INDIVIDUAL ITEM SELECT / UNSELECT TOGGLE
            function SelectItemsToggle(action) {
                if (action === 'select') {
                    checkboxes.forEach(btn => {
                        btn.checked = true;
                    })
                    updateCartSummary()
                    selectAllContainer.style.display = 'none';
                    deselectAllContainer.style.display = 'inline-block';
                }
                if (action === 'deselect') {
                    checkboxes.forEach(btn => {
                        btn.checked = false;
                    })
                    updateCartSummary()
                    selectAllContainer.style.display = 'inline-block';
                    deselectAllContainer.style.display = 'none';
                }
            }

            // updating cart checkout container 
            function updateCartSummary() {
                let selectedCount = 0;
                let price = 0;
                const currentCheckboxes = cartPageContainer.querySelectorAll('.cart-item-checkbox');
                console.log(currentCheckboxes);
                currentCheckboxes.forEach(checkbox =>{
                    if (checkbox.checked) {
                        const itemPrice = Number(checkbox.dataset.price);
                        const quantity = Number(checkbox.dataset.quantity);
                        price += itemPrice * quantity;
                        selectedCount+= quantity; 
                        console.log(price , selectedCount);
                    }
                })
                
                subTotalItems.textContent = `${selectedCount}`;
                totalPrice.textContent = `Rs. ${price}`
            }
            
            // REMOVING ITEMS FROM CART
            function removeCartItems() {
                removeFromCartBtns.forEach(btn => {
                const productId = btn.getAttribute('data-product-id');
                btn.addEventListener('click', async function() {
                    const data = await addRemoveFromCart(productId, null, 'remove');
                    if (data.success) {
                        const cartItem = btn.closest('.cart-item')
                        cartItem.classList.add('removing')
                        updateCartLogo(data.cart_items_count); // Update the cart logo with the new count
                        cartItem.addEventListener('transitionend', function() {
                            cartItem.remove()
                            updateCartSummary();
                        }, {once: true});
                    }
                    else {
                        console.log(data.message);
                    }
                });
                })
            }

            // UPDATE CART QUANTITY FUNCTION 
            function updateCartQuantity(productId, actionType) {
                return fetch('/updatecart/' + productId + '/', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'X-CSRFToken': csrftoken
                    },
                    body: JSON.stringify({
                        action: actionType
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Response from server:', data);
                    return data;
                });
            }

            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateCartSummary);
            });

            updateCartSummary()
            SelectUnselectItems()
            removeCartItems()
            updateQuantity()
        }
        
        // PRODUCT PAGE CART TOGGLE FOR ADDING ITEMS TO CART
        const productPurchaseContainer = document.getElementById('product-right-purchase')
        if (productPurchaseContainer) {
            const addToCartBtn = productPurchaseContainer.querySelector('.add-to-cart-btn');
            const productQuantity = productPurchaseContainer.querySelector('.quantity-value');
            const alreadyInCart = productPurchaseContainer.querySelector('.already-in-cart');
            if (addToCartBtn && productQuantity) {
                const productId = addToCartBtn.getAttribute('data-product-id');
                addToCartBtn.addEventListener('click', async function() {
                    // Prevent multiple clicks while request is running
                    addToCartBtn.disabled = true;

                    const data = await addRemoveFromCart(productId, productQuantity, 'add');
                    if (data.success) {
                        updateCartLogo(data.cart_items_count);

                        // Start the button animation
                        addToCartBtn.classList.add('adding');

                        // Start the "Added to Cart" animation
                        alreadyInCart.classList.add('show');

                    } else {
                        addToCartBtn.disabled = false;
                        console.log(data.message);
                    }
                });
            }
        }
        
        // TOGGLE CART FUNCTION
        function addRemoveFromCart(productId, quantity, toggle) {
            return fetch('/addremovefromcart/' + productId + '/', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    toggle: toggle,
                    quantity: quantity? parseInt(quantity.textContent) : null

                }) 
            })
            .then(response => response.json())
            .then(data => {
                console.log('Response from server:', data);
                return data;
            });
        }

    }
    function checkout(csrftoken) { 
        // CHECKOUT PAGE FUNCTIONALITY
        const checkoutPageContainer = document.getElementById('checkout-page-container');

        if (checkoutPageContainer) {

            const removeFromCheckoutBtns = checkoutPageContainer.querySelectorAll('.checkout-remove-btn');
            const subTotalItems = checkoutPageContainer.querySelector('#checkout-summary-subtotal-items');
            const totalPrice = checkoutPageContainer.querySelector('#checkout-summary-total-price');
            const placeOrderBtn = checkoutPageContainer.querySelector('#order-btn');

            // REMOVING ITEMS FROM CHECKOUT
            function removeCheckoutItems() {
                removeFromCheckoutBtns.forEach(btn => {
                    btn.addEventListener('click', function() {
                        const checkoutItem = btn.closest('.checkout-item');

                        checkoutItem.remove();
                        updateCheckoutSummary();
                        updateEmptyCheckoutMessage();
                    });
                });
            }

            // UPDATING CHECKOUT SUMMARY
            function updateCheckoutSummary() {
                let selectedCount = 0;
                let price = 0;

                const checkoutItems = checkoutPageContainer.querySelectorAll('.checkout-item');

                checkoutItems.forEach(item => {
                    const itemPriceElement = item.querySelector('.checkout-item-price');
                    const quantityElement = item.querySelector('.quantity-value');

                    const itemPrice = Number(itemPriceElement.dataset.price);

                    const quantity = Number(quantityElement.textContent);

                    price += itemPrice * quantity;
                    selectedCount += quantity;
                });

                subTotalItems.textContent = selectedCount;
                totalPrice.textContent = `RS. ${price.toFixed(2)}`;
            }

            // SHOW EMPTY CHECKOUT MESSAGE
            function updateEmptyCheckoutMessage() {
                const checkoutItems = checkoutPageContainer.querySelectorAll('.checkout-item');
                let emptyMessage = checkoutPageContainer.querySelector('.empty-cart-message');

                if (checkoutItems.length === 0) {
                    if (!emptyMessage) {
                        emptyMessage = document.createElement('p');
                        emptyMessage.classList.add('empty-cart-message');
                        emptyMessage.textContent = 'Your checkout is empty.';

                        const checkoutItemsContainer = checkoutPageContainer.querySelector('.checkout-items');

                        if (checkoutItemsContainer) {
                            checkoutItemsContainer.appendChild(emptyMessage);
                        }
                    }

                    if (placeOrderBtn) {
                        placeOrderBtn.disabled = true;
                    }
                } else {
                    if (emptyMessage) {
                        emptyMessage.remove();
                    }

                    if (placeOrderBtn) {
                        placeOrderBtn.disabled = false;
                    }
                }
            }

            // PLACING THE ORDER
            function placeOrder() {
                if (!placeOrderBtn) return;

                placeOrderBtn.addEventListener('click', async function() {
                    const checkoutItems = checkoutPageContainer.querySelectorAll('.checkout-item');

                    const cartItemIds = Array.from(checkoutItems).map(item => {
                        return Number(item.dataset.cartItemId);
                    });

                    if (cartItemIds.length === 0) {
                        console.log('No items selected for checkout.');
                        return;
                    }

                    placeOrderBtn.disabled = true;

                    try {
                        const response = await fetch('/placeorder/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrftoken
                            },
                            body: JSON.stringify({
                                cart_item_ids: cartItemIds
                            })
                        });

                        const data = await response.json();

                        if (data.success) {
                            updateCartLogo(data.cart_items_count);

                            console.log('Order placed successfully:', data.order_id);
                            console.log('Total price:', data.total_price);

                            // Display a confirmation to the user.
                            alert(`Order placed successfully! Order ID: ${data.order_id}`);

                            // Clear the checkout list after successful ordering.
                            const checkoutItemsContainer = checkoutPageContainer.querySelector('.checkout-items');

                            if (checkoutItemsContainer) {
                                checkoutItemsContainer.innerHTML = '';
                            }

                            updateCheckoutSummary();
                            updateEmptyCheckoutMessage();

                        } else {
                            console.log(data.message);
                            alert(data.message);
                            placeOrderBtn.disabled = false;
                        }

                    } catch (error) {
                        console.error('Error placing order:', error);
                        alert('Something went wrong while placing your order.');
                        placeOrderBtn.disabled = false;
                    }
                });
            }

            updateCheckoutSummary();
            updateEmptyCheckoutMessage();
            removeCheckoutItems();
            placeOrder();
        }

    }

    
    Cart(csrftoken);
    checkout(csrftoken);
    productQuantitySelector();
    starRating();
    backToTop();
    burgerMenu();
    readMore();
});
    