from django.contrib import admin

# Register your models here.
from .models import User, Category, Product, Review , OrderItem, Order, CartItem

admin.site.register(User)
admin.site.register(Category)
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', '__str__')
    readonly_fields = ('id',)

admin.site.register(Review)
admin.site.register(OrderItem)
admin.site.register(Order)
admin.site.register(CartItem)