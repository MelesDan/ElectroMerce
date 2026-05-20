from django.contrib import admin

# Register your models here.
from .models import Cart, CartItem


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("id", "cart", "product", "quantity", "subtotal", "added_at")
    list_filter = ("added_at",)
    search_fields = ("product__name", "cart__user__email")


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ("subtotal",)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "total_items", "subtotal", "created_at")
    search_fields = ("user__email",)
    inlines = [CartItemInline]
