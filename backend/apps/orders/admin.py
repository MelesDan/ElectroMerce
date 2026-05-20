from django.contrib import admin

# Register your models here.
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("subtotal", "product_name", "product_price")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "user",
        "status",
        "payment_status",
        "total_amount",
        "created_at",
    )

    list_filter = ("status", "payment_status", "payment_method", "created_at")

    search_fields = ("order_number", "user__email", "shipping_phone")

    ordering = ("-created_at",)

    readonly_fields = ("order_number", "created_at", "updated_at")

    fieldsets = (
        ("Order Info", {"fields": ("order_number", "user", "status")}),
        (
            "Shipping Info",
            {
                "fields": (
                    "shipping_name",
                    "shipping_address",
                    "shipping_city",
                    "shipping_phone",
                )
            },
        ),
        (
            "Payment Info",
            {"fields": ("payment_method", "payment_status", "transaction_id")},
        ),
        (
            "Amounts",
            {
                "fields": (
                    "subtotal",
                    "shipping_cost",
                    "tax",
                    "discount",
                    "total_amount",
                )
            },
        ),
        ("Meta", {"fields": ("notes", "created_at", "updated_at")}),
    )

    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product_name", "quantity", "product_price", "subtotal")

    search_fields = ("product_name", "order__order_number")
