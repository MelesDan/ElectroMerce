from django.urls import path
from .views import (
    CategoryListView,
    CategoryDetailView,
    ProductListView,
    ProductDetailView,
    ReviewCreateView,
    ReviewListView,
    WishlistView,
    FeaturedProductsView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="categories"),
    path(
        "categories/<slug:slug>/", CategoryDetailView.as_view(), name="category-detail"
    ),
    path("products/", ProductListView.as_view(), name="products"),
    path(
        "products/featured/", FeaturedProductsView.as_view(), name="featured-products"
    ),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="product-detail"),
    path(
        "products/<slug:product_slug>/reviews/",
        ReviewListView.as_view(),
        name="product-reviews",
    ),
    path("reviews/", ReviewCreateView.as_view(), name="create-review"),
    path("wishlist/", WishlistView.as_view(), name="wishlist"),
]
