from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register, name='register'),
    path('s', views.search, name='s'),
    path('productpage/<int:product_id>/', views.product_page, name='product_page'),
    path('review/<int:product_id>/', views.review, name='review'),
    path('cart/', views.cart, name='cart'),
    path('about/', views.about, name='about'),
    path('orderhistory/', views.order_history, name='order_history'),
    path('addremovefromcart/<int:product_id>/', views.add_remove_from_cart, name='addRemoveFromCart'),
    path('updatecart/<int:product_id>/', views.update_cart_quantity, name='update_cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('placeorder/', views.place_order, name='place_order'),
]