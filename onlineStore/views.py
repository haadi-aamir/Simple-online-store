from sqlite3 import IntegrityError

from django.core.checks import messages
from django.http import JsonResponse, request
from django.shortcuts import get_object_or_404, redirect, render
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .models import User , Product, Category, Review , Order , OrderItem , CartItem
from django.db import transaction
from django.db.models import Q , Avg, Count, Sum 
from decimal import Decimal
import json

# Create your views here.
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('index')
        else:
            return render(request, 'onlineStore/login.html', {
                'error_message': 'Invalid username or password!'
            })
    elif request.method == 'GET':
        return render(request, 'onlineStore/login.html')
    
def logout_view(request):
    logout(request)
    return redirect('index')

def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        c_password = request.POST.get('confirm_password')
        
        if password != c_password:
            return render(request, 'onlineStore/register.html', {
                'error_message': 'Passwords do not match!'
            })
        
        try:
            user = User.objects.create_user(username=username, password=password)
        except IntegrityError:
            return render(request, 'onlineStore/register.html', {
                'error_message': 'Username already exists!'
            })
        login(request, user)
        return redirect('index')
    
    elif request.method == 'GET':
        return render(request, 'onlineStore/register.html')


def index(request):
    return render(request, 'onlineStore/index.html')

def search(request):
    query = request.GET.get('q')
    if query:
        # logic to search for products:
        print(query)
         
        exact_product = Product.objects.filter(name__iexact=query).annotate(
            average_rating=Avg('reviews__rating'),
        )
        exact_category = Category.objects.filter(name__iexact=query)
        
        if exact_product.exists():
            # Case 1: Search for exact name match  
            product = exact_product.first()
            product_categories = product.categories.all()
            related_products = Product.objects.filter(categories__in=product_categories).exclude(id=product.id).distinct().annotate(
                average_rating=Avg('reviews__rating'),
            )

            return render(request, 'onlineStore/search.html', {
                'products': exact_product,
                'related_products': related_products,
            })
        elif exact_category.exists():
            # Case 2: Search for exact category match
            products_in_category = Product.objects.filter(categories__in=exact_category).annotate(
                average_rating=Avg('reviews__rating'),
            )
            
            print("no exact product, but found category i.e case 2")
            return render(request, 'onlineStore/search.html', {
                'products': products_in_category,
                'related_products': [],
            })
        else:
            print('No exact product or category. onto case3')
            # Case 3: Search for partial matches
            
            # 1: Search for products and categories that contain the query string
            categories = Category.objects.filter(name__icontains=query)   
            products = Product.objects.filter(
                        Q(name__icontains=query) | Q(categories__in=categories)
                    ).distinct().annotate(
                        average_rating=Avg('reviews__rating'),
                    )
            
            if not products.exists():
                print('No products found for the search query.')
                return render(request, 'onlineStore/search.html', {
                    'products': [],
                    'related_products': [],
                }) 
                   
            # 2: Get categories of the products found in step 1 and find other products in those categories,
            # excluding the products already found
            related_product_categories = products.values_list('categories__name', flat=True).distinct()
            related_products = Product.objects.filter(categories__name__in=related_product_categories).exclude(
                id__in=products.values_list('id', flat=True)
                ).distinct().annotate(
                average_rating=Avg('reviews__rating'),
                review_count=Count('reviews')
            )
            print(f'Related product categories: {related_product_categories}')
            print(f'Found products: {products}')
            print(f'Found related products: {related_products}')
        
            return render(request, 'onlineStore/search.html', {
                'products': products,
                'related_products': related_products,
            })
    else:
        return render(request, 'onlineStore/index.html')


def product_page(request, product_id):
    product = Product.objects.get(id=product_id)
    avg_rating = product.reviews.aggregate(average_rating=Avg('rating'))['average_rating'] or 0
    review_count = product.reviews.count()
    product_reviews = Review.objects.filter(product=product)
    in_cart = CartItem.objects.filter(product=product, user=request.user).exists()
    print(f'Product: {product}, Average Rating: {avg_rating}')
    return render(request, 'onlineStore/product_page.html', {
        'product': product,
        'avg_rating': avg_rating,
        'review_count': review_count,
        'product_reviews': product_reviews,
        'in_cart': in_cart,
    })

@login_required
def add_remove_from_cart(request, product_id):
    if request.method == 'POST':
        product = get_object_or_404(Product, id=product_id)
        data = json.loads(request.body)
        toggle = data.get('toggle')
        quantity = data.get('quantity', 1)  # Default to 1 if not provided
        
        # Handle adding or removing the product from the cart based on the toggle value
        
        if toggle == 'add':
             # quantity validation 
            if quantity < 1:
                return JsonResponse({'message': 'Quantity must be at least 1.', 'success': False}, status=400)
            if quantity > product.stock:
                return JsonResponse({'message': f'Quantity exceeds available stock ({product.stock}).', 'success': False}, status=400)
            
            CartItem.objects.update_or_create(
                user=request.user,
                product=product,
                defaults={'quantity': quantity} # not used to look up the existing item
            )
            # CALCULATING THE TOTAL NUMBER OF ITEMS IN THE CART AFTER ADDING AN ITEM
            total_cart_items_count = CartItem.objects.filter(
                user=request.user
            ).aggregate(
                total_quantity=Sum('quantity')
            )['total_quantity'] or 0

            return JsonResponse(
                {'message': f'Product {product.name} added to cart with quantity {quantity}.',
                 'success': True,
                 'cart_items_count': total_cart_items_count}
            )
        elif toggle == 'remove':
            CartItem.objects.filter(user=request.user, product=product).delete()
            # CALCULATING THE TOTAL NUMBER OF ITEMS IN THE CART AFTER REMOVING AN ITEM
            total_cart_items_count = CartItem.objects.filter(
                user=request.user).aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0

            return JsonResponse(
                {'message': f'Product {product.name} removed from cart.',
                 'success': True,
                 'cart_items_count': total_cart_items_count}
            )
        return JsonResponse({'message': 'Invalid toggle action.', 'success': False}, status=400)

@login_required
def update_cart_quantity(request, product_id):
    if request.method == 'POST':
        product = get_object_or_404(Product, id=product_id)
        cart_item = get_object_or_404(CartItem, user=request.user, product=product)
        action_type = json.loads(request.body).get('action')
        
        if action_type == 'increase':
            if cart_item.quantity < product.stock:
                cart_item.quantity += 1
                cart_item.save()
                total_cart_items_count = CartItem.objects.filter(user=request.user).aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0
                return JsonResponse({'message': f'Increased quantity of {product.name} to {cart_item.quantity}.', 'success': True, 'cart_items_count': total_cart_items_count})
            else:
                return JsonResponse({'message': f'Cannot increase quantity. Only {product.stock} items in stock.', 'success': False}, status=400)
        
        elif action_type == 'decrease':
            if cart_item.quantity > 1:
                cart_item.quantity -= 1
                cart_item.save()
                total_cart_items_count = CartItem.objects.filter(user=request.user).aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0
                return JsonResponse({'message': f'Decreased quantity of {product.name} to {cart_item.quantity}.', 'success': True, 'cart_items_count': total_cart_items_count})
            else:
                return JsonResponse({'message': 'Quantity cannot be less than 1.', 'success': False}, status=400)
        
        return JsonResponse({'message': 'Invalid action type.', 'success': False}, status=400)

@login_required
def cart(request):
    if request.method == 'GET':
        cart_items = CartItem.objects.filter(user=request.user)
        print(f'Cart items for user {request.user.username}: {cart_items}')
        return render(request, 'onlineStore/cart.html', {
            'cart_items': cart_items,
        })


@login_required
def review(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    has_bought = OrderItem.objects.filter(order__user=request.user, product_id=product_id).exists()
    has_reviewed = Review.objects.filter(product=product, user=request.user).exists()
    if not has_bought:
        messages.Error(request, "You can only review products you have purchased.")
        return redirect('product_page', product_id=product_id)
    if has_reviewed:
        messages.Error(request, "You have already reviewed this product.")
        return redirect('product_page', product_id=product_id)
    
    if request.method == 'GET': 
        product = Product.objects.get(id=product_id )  
        return render(request, 'onlineStore/review.html', {
            'product': product,
        })
    elif request.method == 'POST':
        rating = request.POST.get('rating')
        comment = request.POST.get('comment')
        product = Product.objects.get(id=product_id)
        Review.objects.create(product=product, user=request.user, rating=rating, comment=comment)

        print(f'Rating: {rating}, Comment: {comment}, Product: {product}')
        
        return redirect('product_page', product_id=product.id)

@login_required
def order_history(request):
    if request.method == "GET":
        orders = Order.objects.filter(user=request.user).order_by('-date_ordered')
        return render(request, 'onlineStore/order_history.html', {'orders': orders})
    return JsonResponse({'message': 'Invalid request method.'}, status=405)

@login_required
def checkout(request):
    if request.method == 'POST':
        items = request.POST.getlist('item')
        items = CartItem.objects.filter(user=request.user, id__in=items)
        print("items", items)
        print("all Cart items of this user:", CartItem.objects.filter(user=request.user))
        return render(request, 'onlineStore/checkout.html', {
            'checkout_items': items,
        })
    
    return JsonResponse({
        'success': False,
        'message': 'Invalid request method.'
    }, status=405)


@login_required
def place_order(request):
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'message': 'Invalid request method.'
        }, status=405)

    try:
        data = json.loads(request.body)
        item_ids = data.get('cart_item_ids', [])

        if not isinstance(item_ids, list) or not item_ids:
            return JsonResponse({
                'success': False,
                'message': 'No items selected for checkout.'
            }, status=400)

        # Validate that every ID is a positive integer.
        if any(
            type(item_id) is not int or item_id <= 0
            for item_id in item_ids
        ):
            return JsonResponse({
                'success': False,
                'message': 'Invalid cart item IDs.'
            }, status=400)

        # Remove duplicate IDs from the submitted list.
        item_ids = list(dict.fromkeys(item_ids))

        with transaction.atomic():

            # Retrieve only this user's selected cart items.
            cart_items = list(
                CartItem.objects.filter(
                    user=request.user,
                    id__in=item_ids
                ).select_for_update().select_related('product')
            )

            # Reject the request if any submitted item is invalid,
            # deleted, or belongs to another user.
            if len(cart_items) != len(item_ids):
                return JsonResponse({
                    'success': False,
                    'message': 'Some selected cart items are invalid.'
                }, status=400)

            # Lock the relevant products and retrieve current stock/prices.
            product_ids = {
                item.product_id for item in cart_items
            }

            products = {
                product.id: product
                for product in Product.objects.select_for_update().filter(
                    id__in=product_ids
                )
            }

            # Check stock before making any changes.
            for item in cart_items:
                product = products.get(item.product_id)

                if product is None:
                    return JsonResponse({
                        'success': False,
                        'message': 'A selected product no longer exists.'
                    }, status=400)

                if item.quantity > product.stock:
                    return JsonResponse({
                        'success': False,
                        'message': (
                            f'Insufficient stock for {product.name}. '
                            f'Available stock: {product.stock}.'
                        )
                    }, status=400)

            # Create the order only after all stock checks pass.
            order = Order.objects.create(user=request.user)

            total_price = Decimal('0.00')

            for item in cart_items:
                product = products[item.product_id]

                # Record the price at the time of purchase.
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item.quantity,
                    price=product.price
                )

                total_price += product.price * item.quantity

                # Reduce available stock.
                product.stock -= item.quantity
                product.save(update_fields=['stock'])

            # Remove purchased items from the cart only.
            CartItem.objects.filter(
                user=request.user,
                id__in=item_ids
            ).delete()

        # Calculate the updated cart quantity after the transaction.
        remaining_cart_count = CartItem.objects.filter(
            user=request.user
        ).aggregate(
            total_quantity=Sum('quantity')
        )['total_quantity'] or 0

        return JsonResponse({
            'success': True,
            'message': 'Order placed successfully.',
            'order_id': order.id,
            'total_price': str(total_price),
            'cart_items_count': remaining_cart_count
        })

    except (json.JSONDecodeError, TypeError, ValueError):
        return JsonResponse({
            'success': False,
            'message': 'Invalid request data.'
        }, status=400)


def about(request):
    return render(request, 'onlineStore/about.html')

