from django.contrib import admin
from .models import Payment


# Register your models here.
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "transaction_id",
        "amount",
        "status",
        "payment_method",
        "created_at",
    )

    list_filter = ("status", "payment_method", "created_at")

    search_fields = ("transaction_id", "order__order_number", "order__user__email")

    ordering = ("-created_at",)

    readonly_fields = ("transaction_id", "created_at", "updated_at")

    fieldsets = (
        (
            "Payment Info",
            {
                "fields": (
                    "order",
                    "transaction_id",
                    "amount",
                    "status",
                    "payment_method",
                )
            },
        ),
        ("Details", {"fields": ("payment_details",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
