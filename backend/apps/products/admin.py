from django.contrib import admin
from .models import Category, Product, ProductImage, Review, Wishlist


# Register your models here.
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "parent", "created_at")
    search_fields = ("name",)
    list_filter = ("created_at",)
    prepopulated_fields = {"slug": ("name",)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fk_name = "product"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "category",
        "price",
        "stock_quantity",
        "is_featured",
        "is_active",
        "rating",
        "created_at",
    )

    list_filter = ("category", "is_active", "is_featured", "condition", "created_at")

    search_fields = ("name", "sku", "brand", "description")

    prepopulated_fields = {"slug": ("name",)}

    readonly_fields = ("rating", "total_reviews", "views_count")

    inlines = [ProductImageInline]

    fieldsets = (
        (
            "Basic Info",
            {
                "fields": (
                    "name",
                    "slug",
                    "category",
                    "description",
                    "short_description",
                )
            },
        ),
        ("Pricing", {"fields": ("price", "compare_price")}),
        (
            "Inventory",
            {
                "fields": (
                    "stock_quantity",
                    "sku",
                    "brand",
                    "condition",
                    "warranty_months",
                )
            },
        ),
        ("Media", {"fields": ("main_image", "images")}),
        ("Status", {"fields": ("is_active", "is_featured")}),
        ("Analytics", {"fields": ("rating", "total_reviews", "views_count")}),
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "user", "rating", "is_verified", "created_at")

    list_filter = ("rating", "is_verified", "created_at")

    search_fields = ("product__name", "user__email", "title")

    ordering = ("-created_at",)


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "product", "added_at")

    search_fields = ("user__email", "product__name")

    list_filter = ("added_at",)
