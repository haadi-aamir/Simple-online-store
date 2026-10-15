from django.db.models import Sum


def cart_context(request):
    if request.user.is_authenticated:
        cart_items_count = request.user.cart_items.aggregate(
            total=Sum('quantity')
        )['total'] or 0
    else:
        cart_items_count = 0

    return {
        'cart_items_count': cart_items_count
    }